<?php

    use AmoCRM\Exceptions\AmoCRMApiException;

    include_once 'config.php';
    $Config = new Config();

    $select = 'SELECT * FROM billing_timer WHERE id = "' . $_POST['timer_ID'] . '"';
    $result = $mysqli->query($select)->fetch_assoc();

    // количество минут таймера * стоимость сотрудника
    $time_start = '01.01.2000 00:00:00';
    $time_finish = $result['time_work'];
    $minutes = round(abs(strtotime($time_start) - strtotime($time_finish)) / 60);
    $price = $minutes * (int) $_POST['price_manager'];

    // время, затраченное на работу
    $time_work = explode(' ', $result['time_work'])[1];

    // обновляем состояние таймера
    $charset = mb_detect_encoding($_POST['comment']);
    $unicode_string = iconv($charset, "UTF-8", $_POST['comment']);
    $comment = str_ireplace('"', '\"', $unicode_string);

    $update = '
        UPDATE billing_timer
        SET user = "' . $_POST['user'] . '",
            client = "' . $_POST['client'] . '",
            service = "' . $_POST['service'] . '",
            comment = "' . $comment . '",
            price = "' . $price . '",
            time_work = "' . $time_work . '",
            status = "finish"
        WHERE id = "' . $_POST['timer_ID'] . '"
    ';

    $mysqli->query($update);

    // обновляем депозит
    $select = 'SELECT * FROM billing_deposit WHERE essence_id = "' . $_POST['essence_ID'] . '"';
    $result = $mysqli->query($select);

    if (!$result->num_rows) {
        $deposit = 0;
        $deposit -= $price;

        $insert = '
                INSERT INTO billing_deposit
                VALUES(
                null,
                    "' . $_POST['essence_ID'] . '",
                    "' . $deposit . '",
                    ""
            )
        ';

        $mysqli->query($insert);
        $select = 'SELECT * FROM billing_deposit WHERE essence_id = "' . $_POST['essence_ID'] . '"';
        $result = $mysqli->query($select);
    } else {
        $result = $result->fetch_assoc();
        $deposit = (int) $result['deposit'] - $price;

        $update = '
            UPDATE billing_deposit
            SET deposit = "' . $deposit . '"
            WHERE essence_id = "' . $_POST['essence_ID'] . '"
        ';

        $mysqli->query($update);
    }

    print_r(json_encode(true));

    // ищем ID сущности в покупателях
    $is_customer = true;

    try {
        $customer = $apiClient->customers()->getOne($_POST['essence_ID']);
        usleep(20000);
    } catch (AmoCRMApiException $e) {}

    // если такой сущности нет, ищем в сделках
    if (!$customer) {
        $is_customer = false;

        try {
            $customer = $apiClient->leads()->getOne($_POST['essence_ID']);
            usleep(20000);
        } catch (AmoCRMApiException $e) {}
    }

    // если не нашли, выходим
    if (!$customer) return;

    // получаем поля
    $custom_fields = $customer->getCustomFieldsValues();
    usleep(20000);

    // ищем остаток депозита
    if (!$custom_fields) return;

    $field_ID = null;
    $field_type = null;

    foreach ($custom_fields as $item) {
        if (mb_strtolower($item->getFieldName()) === mb_strtolower($_POST['deposit_title'])) {
            $field_ID = $item->getFieldId();
            $field_type = $item->getFieldType();

            if ($field_type === 'text') $field_type = 'TextCustomFieldModel';
            if ($field_type === 'numeric') $field_type = 'NumericCustomFieldModel';
        }
    }

    // если поле не найдено, выходим
    if (!$field_ID) return;

    // обновляем поле
    $custom_fields = $Config->SetFieldValue($custom_fields, $field_type, $field_ID, $deposit);
    usleep(20000);

    if ($is_customer) {
        $apiClient->customers()->updateOne($customer);
        usleep(20000);
    }
    else {
        $apiClient->leads()->updateOne($customer);
        usleep(20000);
    }
