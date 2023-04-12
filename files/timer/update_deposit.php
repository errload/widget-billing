<?php

    use AmoCRM\Exceptions\AmoCRMApiException;

    include_once 'config.php';
    $Config = new Config();

    // добавляем запись с добавлением депозита в таймер
    $tz = $_POST['timezone'];
    $dt = new DateTime('now', new DateTimeZone($tz));
    $dt->setTimestamp(time());

    $insert = '
        INSERT INTO billing_timer
        VALUES(
            null,
            "' . $_POST['essence_ID'] . '",
            "' . $_POST['user_ID'] . '",
            "Пополнение депозита",
            "",
            "",
            "",
            "' . $_POST['price'] . '",
            "",
            "' . $dt->format('d.m.Y H:i:s') . '",
            "' . $_POST['timezone'] . '",
            "",
            "",
            "finish",
            "0"
        )
    ';

    $mysqli->query($insert);

    $select = 'SELECT * FROM billing_deposit WHERE essence_id = "' . $_POST['essence_ID'] . '"';
    $result = $mysqli->query($select);

    if (!$result->num_rows) {
        $insert = '
            INSERT INTO billing_deposit
            VALUES(
                null,
                "' . $_POST['essence_ID'] . '",
                "' . $_POST['deposit'] . '",
                ""
            )
        ';

        $mysqli->query($insert);
    } else {
        $update = '
            UPDATE billing_deposit
            SET deposit = "' . $_POST['deposit'] . '"
            WHERE essence_id = "' . $_POST['essence_ID'] . '"
        ';

        $mysqli->query($update);
    }

    print_r(json_encode([]));

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
    $custom_fields = $Config->SetFieldValue($custom_fields, $field_type, $field_ID, $_POST['deposit']);

    if ($is_customer) {
        $apiClient->customers()->updateOne($customer);
        usleep(20000);
    }
    else {
        $apiClient->leads()->updateOne($customer);
        usleep(20000);
    }
