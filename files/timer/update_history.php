<?php

    use AmoCRM\Exceptions\AmoCRMApiException;

    include_once 'config.php';
    $Config = new Config();

    $select = 'SELECT * FROM billing_timer WHERE id = "' . $_POST['history_ID'] . '"';
    $result = $mysqli->query($select)->fetch_assoc();

    // проверяем было ли изменено время
    if ($result['time_work'] !== $_POST['time_work'] || $result['is_change_time']) $is_change_time = true;
    else $is_change_time = false;

    // считаем разницу в стоимости работы
    $deposit = 0;
    $price = (int) $_POST['price'];

    // если новая стоимость больше, прибавляем к депозиту
    if ((int) $result['price'] > $price) $deposit += (int) $result['price'] - $price;
    // иначе отнимаем
    elseif ((int) $result['price'] < $price) $deposit -= $price - (int) $result['price'];
    // иначе депозит остается прежним
    else $deposit = 0;

    // считаем разницу во времени
    $new_time = $_POST['time_work'];
    $old_time = '01.01.2000' . $result['time_work'];

    $new_time_h = explode(':', $new_time)[0];
    $new_time_i = explode(':', $new_time)[1];
    $new_time_s = explode(':', $new_time)[2];

    if (!$new_time_h) $new_time_h = '00';
    if (!$new_time_i) $new_time_i = '00';
    if (!$new_time_s) $new_time_s = '00';
    $new_time = '01.01.2000 ' . implode(':', [$new_time_h, $new_time_i, $new_time_s]);

    $new_time = strtotime($new_time);
    $old_time = strtotime($old_time);
    $minutes = null;

    // если есть разница во времени
    $price = $_POST['price'];

    if ($new_time !== $old_time) {
        if ($new_time > $old_time) {
            // отнимаем от депозита время в минутах * на стоимость сотрудника
            $minutes = round(abs($new_time - $old_time) / 60);
            $deposit = $deposit - ($minutes * (int) $_POST['price_manager']);
            // прибавляем к стоимости новую стоимость в минутах
            $price += $minutes * (int) $_POST['price_manager'];
        } else {
            // прибавляем к депозиту время в минутах * на стоимость сотрудника
            $minutes = round(abs($old_time - $new_time) / 60);
            $deposit = $deposit + ($minutes * (int) $_POST['price_manager']);
            // отнимаем от стоимости новую стоимость в минутах
            $price -= $minutes * (int) $_POST['price_manager'];
        }
    }

    // обновляем историю
    $charset = mb_detect_encoding($_POST['comment']);
    $unicodeString = iconv($charset, "UTF-8", $_POST['comment']);
    $comment = str_ireplace('"', '\"', $unicodeString);

    $update = '
        UPDATE billing_timer
        SET user = "' . $_POST['user'] . '",
            client = "' . $_POST['client'] . '",
            service = "' . $_POST['service'] . '",
            comment = "' . $comment . '",
            link_task = "' . $_POST['link_task'] . '",
            price = "' . $price . '",
            time_work = "' . $_POST['time_work'] . '",
            is_change_time = "' . $is_change_time . '"
        WHERE id = "' . $_POST['history_ID'] . '"
    ';

    $mysqli->query($update);
    $select = 'SELECT * FROM billing_timer WHERE id = "' . $_POST['history_ID'] . '"';
    $response = $mysqli->query($select)->fetch_assoc();

    print_r(json_encode($response));

    // обновляем сумму депозита
    $select = 'SELECT * FROM billing_deposit WHERE essence_id = "' . $_POST['essence_ID'] . '"';
    $result = $mysqli->query($select)->fetch_assoc();
    $deposit = (int) $result['deposit'] + $deposit;

    $update = 'UPDATE billing_deposit SET deposit = "' . $deposit . '" WHERE essence_id = "' . $_POST['essence_ID'] . '"';
    $mysqli->query($update);

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

    // ищем остаток депозита, иначе создаем со значением 0
    if ($custom_fields) {
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

        if ($is_customer) $apiClient->customers()->updateOne($customer);
        else $apiClient->leads()->updateOne($customer);
    }
