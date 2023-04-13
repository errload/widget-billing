<?php
	ini_set('error_log', 'error_in_templates.log');
    date_default_timezone_set('Europe/Moscow');
    header('Content-type: application/json;charset=utf8');
//    header('Content-type: text/html; charset=utf8');
	header('Access-Control-Allow-Origin: *');

    include_once 'config.php';

    use AmoCRM\Collections\ContactsCollection;
    use AmoCRM\Collections\LinksCollection;
    use AmoCRM\Exceptions\AmoCRMApiException;
    use AmoCRM\Models\ContactModel;
    use AmoCRM\Models\CustomFieldsValues\ValueCollections\NullCustomFieldValueCollection;
    use AmoCRM\Models\LeadModel;
    use AmoCRM\Helpers\EntityTypesInterface;
    use AmoCRM\Collections\NotesCollection;
    use AmoCRM\Collections\TasksCollection;
    use AmoCRM\Models\TaskModel;
    use AmoCRM\Filters\TasksFilter;

    $Config = new Config();

    if ($_POST['method'] == 'settings') {
        // echo 'Блок первичных настроек Авторизации виджета <br>';
        echo '<div id="settings_WidgetBilling">';
        $path = $Config->Set_Path_From_Domain($_POST['domain']);
        $settings = $_POST['settings'];
        $settings['secret'] =  $_POST['secret'];
        $Config->SaveSettings($settings);

        if (($_POST['settings']['active'] == 'Y') || ($_POST['settings']['status'] == 'installed')) {
            echo $Config->Authorization();
            if ($Config->CheckToken()) include_once 'templates/advancedsettings.html';
        } else {
            $Config->deleteToken();
            echo 'Виджет еще не установлен. Установите. <br>';
        }

        echo '</div>';
        exit;
    }

    $Config->GetSettings($_POST['domain']);
    if ($Config->CheckToken()) $apiClient = $Config->getAMO_apiClient();
    else {
        if ($_POST['method'] == 'advancedsettings') echo $Config->Authorization();
        exit;
    }

/* ########################################################################################################## */

    $hostname = 'localhost';
    $username = 'n108089_andreev';
    $password = 'ZUCzh$bm5i24M#pN';
    $database = 'n108089_andreev';

    $mysqli = new mysqli($hostname, $username, $password, $database);
    if ($mysqli->connect_errno) die($mysqli->connect_error);
    mysqli_set_charset($mysqli, 'utf8');

    /* ########################################################################################################## */

    // проверка авторизации для запуска таймера
    if ($_POST['method'] == 'is_auth') {
        if ($Config->CheckToken()) echo json_encode(true);
        else echo json_encode(false);
    }

    if ($_POST['method'] == 'isAuth') {
        if ($Config->CheckToken()) echo json_encode(true);
        else echo json_encode(false);
    }

    /* ########################################################################################################## */

    // получение ссылки на проект
    if ($_REQUEST['method'] == 'get_link_project' && $Config->CheckToken()) include 'timer/get_link_project.php';
    // обновление ссылки на проект
    if ($_REQUEST['method'] == 'edit_link_project' && $Config->CheckToken()) include 'timer/edit_link_project.php';

    /* ************************************************************** */

    // отображение запущенных таймеров, или нового
    if ($_POST['method'] == 'get_timers' && $Config->CheckToken()) include 'timer/get_timers.php';
    // старт таймера
    if ($_POST['method'] == 'start_timer' && $Config->CheckToken()) include 'timer/timer_start.php';
    // авто стоп таймера
    if ($_POST['method'] == 'auto_stop_timer' && $Config->CheckToken()) include 'timer/timer_auto_stop.php';
    // пауза таймера
    if ($_POST['method'] == 'pause_timer' && $Config->CheckToken()) include 'timer/timer_pause.php';
    // стоп таймера
    if ($_POST['method'] == 'stop_timer' && $Config->CheckToken()) include 'timer/timer_stop.php';
    // сохранение таймера
    if ($_POST['method'] == 'save_timer' && $Config->CheckToken()) include 'timer/timer_save.php';

    /* ************************************************************** */

    // получение контактов сущности
    if ($_POST['method'] == 'get_clients' && $Config->CheckToken()) include 'timer/get_clients.php';
    // получение списка услуг
    if ($_POST['method'] == 'get_services' && $Config->CheckToken()) include 'timer/get_services.php';
    // обновление списка услуг
    if ($_POST['method'] == 'update_services' && $Config->CheckToken()) include 'timer/update_services.php';

    /* ************************************************************** */

    // получаем депозит
    if ($_POST['method'] == 'deposit_get' && $Config->CheckToken()) include 'timer/get_deposit.php';
    // обновляем депозит
    if ($_POST['method'] == 'update_deposit' && $Config->CheckToken()) include 'timer/update_deposit.php';

    /* ************************************************************** */

    // получаем историю
    if ($_POST['method'] == 'get_history' && $Config->CheckToken()) include 'timer/get_history.php';
    // итоговая сумма истории
    if ($_POST['method'] == 'get_history_results_sum' && $Config->CheckToken()) include 'timer/get_history_results_sum.php';
    // средний расход по списанию
    if ($_POST['method'] == 'get_history_consumption_sum' && $Config->CheckToken()) include 'timer/get_history_consumption_sum.php';
    // поиск истории по фильтру
    if ($_POST['method'] == 'get_history_filter' && $Config->CheckToken()) include 'timer/get_history_filter.php';
    // поиск таймера по ID
    if ($_POST['method'] == 'get_timer' && $Config->CheckToken()) include 'timer/get_timer.php';




















    // получаем ссылку на проект
    if ($_POST['method'] == 'link_project' && $Config->CheckToken()) {
        $select = '
            SELECT * 
            FROM billing_deposit 
            WHERE essence_id = "' . $_POST['essence_id'] . '"
        ';

        $result = $mysqli->query($select);
        if (!$result->num_rows) $result = '';
        else {
            $result = $result->fetch_array();
            $result = $result['link_project'];
        }

        echo json_encode($result);
    }

    // обновляем ссылку на проект
    if ($_POST['method'] == 'change_link_project' && $Config->CheckToken()) {
        $select = '
            SELECT * 
            FROM billing_deposit 
            WHERE essence_id = "' . $_POST['essence_id'] . '"
        ';
        $update = '
            UPDATE billing_deposit 
            SET link_project = "' . $_POST['link_project'] . '" 
            WHERE essence_id = "' . $_POST['essence_id'] . '"
        ';
        $insert = '
            INSERT INTO billing_deposit 
            VALUES(
                   null, 
                   "' . $_POST['essence_id'] . '", 
                   0, 
                   "' . $_POST['link_project'] . '"
            )
        ';

        $result = $mysqli->query($select);
        if (!$result->num_rows) $mysqli->query($insert);
        else $mysqli->query($update);
        $result = $mysqli->query($select)->fetch_array();

        echo json_encode($result['link_project']);
    }

    /* ##################################################################### */

    // получение существующих таймеров
    if ($_POST['method'] == 'search_timer' && $Config->CheckToken()) {
        $select = '
            SELECT * 
            FROM billing_timer 
            WHERE user_id = "' . $_POST['user_id'] . '" 
                AND essence_id = "' . $_POST['essence_id'] . '"
                AND status != "finish"
        ';

        $result = $mysqli->query($select);

        if (!$result->num_rows) {
            echo json_encode(false);
            return false;
        }

        $result = $result->fetch_all();

        foreach ($result as $key => $timer) {
            // разнца между стартом и паузой
            if ($timer[13] === 'start') {
                // разнца между стартом и паузой
                $time_start = new DateTime($timer[11], new DateTimeZone($timer[10]));
                $time_now = new DateTime('now', new DateTimeZone($timer[10]));
                $time_diff = $time_now->diff($time_start);

                // добавляем разницу к таймеру
                $time_work = new DateTime($timer[12]);
                $dateInterval = new DateInterval('PT' . $time_diff->h . 'H' . $time_diff->i . 'M' . $time_diff->s . 'S');
                $time_work->add($dateInterval)->format('d.m.Y H:i:s');
            } else $time_work = new DateTime($timer[12]);

            // если разница больше суток, дату ставим 23:59:59 как максимальную
            if ($time_work->format('d.m.Y') !== '01.01.2000') {
                $time_work = new DateTime('01.01.2000 23:59:59');

                // обновляем время таймера
                $update = '
                    UPDATE billing_timer
                    SET time_start = "",
                        time_work = "' . $time_work->format('d.m.Y H:i:s') . '",
                        status = "stop"
                    WHERE id = "' . $timer[0] . '"
                ';

                $mysqli->query($update);
            }

            // новое значение времени
            $result[$key][12] = $time_work->format('d.m.Y H:i:s');
        }

        print_r(json_encode($result));
    }

    /* ##################################################################### */

    // timer start
    if ($_POST['method'] == 'timer_start' && $Config->CheckToken()) {
        // ставим остальные запущенные таймеры на паузу
        $select = '
            SELECT *
            FROM billing_timer
            WHERE user_id = "' . $_POST['user_id'] . '"
                AND essence_id = "' . $_POST['essence_id'] . '"
                AND status = "start"
        ';

        $result = $mysqli->query($select)->fetch_all();

        if (count($result)) {
            foreach ($result as $timer) {
                // разнца между стартом и паузой
                $time_start = new DateTime($timer[11], new DateTimeZone($timer[10]));
                $time_now = new DateTime('now', new DateTimeZone($timer[10]));
                $time_diff = $time_now->diff($time_start);

                // добавляем разницу к таймеру
                $time_work = new DateTime($timer[12]);
                $dateInterval = new DateInterval('PT' . $time_diff->h . 'H' . $time_diff->i . 'M' . $time_diff->s . 'S');
                $time_work->add($dateInterval)->format('d.m.Y H:i:s');

                // если разница больше суток, дату ставим 23:59:59 как максимальную
                if ($time_work->format('d.m.Y') !== '01.01.2000') {
                    $time_work = new DateTime('01.01.2000 23:59:59');
                }

                // обновляем значение в таблице
                $update = '
                    UPDATE billing_timer
                    SET time_start = "",
                        status = "pause",
                        time_work = "' . $time_work->format('d.m.Y H:i:s') . '"
                    WHERE id = "' . $timer[0] . '"
                ';

                $mysqli->query($update);
            }
        }

        // текущее время
        $tz = $_POST['timezone'];
        $dt = new DateTime('now', new DateTimeZone($tz));
        $dt->setTimestamp(time());
        $timer_ID = $_POST['timer_ID'];

        $select = 'SELECT * FROM billing_timer WHERE id = "' . $timer_ID . '"';
        $result = $mysqli->query($select);

        // если первый старт, создаем запись
        if (!$result->num_rows) {
            $insert = '
                INSERT INTO billing_timer
                VALUES(
                    null,
                    "' . $_POST['essence_id'] . '",
                    "' . $_POST['user_id'] . '",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "' . $_POST['link_task'] . '",
                    "' . $dt->format('d.m.Y H:i:s') . '",
                    "' . $_POST['timezone'] . '",
                    "' . $dt->format('d.m.Y H:i:s') . '",
                    "01.01.2000 00:00:00",
                    "start",
                    "0"
                )
            ';

            $mysqli->query($insert);
            $timer_ID = $mysqli->insert_id;

        // иначе обновляем
        } else {
            $update = '
                UPDATE billing_timer
                SET time_start = "' . $dt->format('d.m.Y H:i:s') . '",
                    status = "start"
                WHERE id = "' . $timer_ID . '"
            ';

            $mysqli->query($update);
        }

        $select = 'SELECT * FROM billing_timer WHERE id = "' . $timer_ID . '"';
        $result = $mysqli->query($select)->fetch_assoc();

        print_r(json_encode($result));
    }

    // timer auto stop
    if ($_POST['method'] == 'timer_auto_stop' && $Config->CheckToken()) {
        // обновляем время старта
        $update = '
                UPDATE billing_timer
                SET time_start = "",
                    status = "stop",
                    time_work = "01.01.2000 23:59:59"
                WHERE id = "' . $_POST['timer_id'] . '"
            ';

        $mysqli->query($update);
    }

    // timer pause
    if ($_POST['method'] == 'timer_pause' && $Config->CheckToken()) {
        $select = '
            SELECT * 
            FROM billing_timer 
            WHERE user_id = "' . $_POST['user_id'] . '" 
                AND essence_id = "' . $_POST['essence_id'] . '"
                AND link_task = "' . $_POST['link_task'] . '"
                AND status != "finish"
        ';
        $result = $mysqli->query($select)->fetch_assoc();

        // разнца между стартом и паузой
        $time_start = new DateTime($result['time_start'], new DateTimeZone($result['timezone']));
        $time_now = new DateTime('now', new DateTimeZone($result['timezone']));
        $time_diff = $time_now->diff($time_start);

        // добавляем разницу к таймеру
        $time_work = new DateTime($result['time_work']);
        $dateInterval = new DateInterval('PT' . $time_diff->h . 'H' . $time_diff->i . 'M' . $time_diff->s . 'S');
        $time_work->add($dateInterval)->format('d.m.Y H:i:s');

        // если разница больше суток, дату ставим 23:59:59 как максимальную
        if ($time_work->format('d.m.Y') !== '01.01.2000') {
            $time_work = new DateTime('01.01.2000 23:59:59');
        }

        // обновляем значение в таблице
        $update = '
            UPDATE billing_timer
            SET time_start = "",
                status = "pause",
                time_work = "' . $time_work->format('d.m.Y H:i:s') . '"
            WHERE essence_id = "' . $_POST['essence_id'] . '"
                AND user_id = "' . $_POST['user_id'] . '"
                AND link_task = "' . $_POST['link_task'] . '"
                AND status != "finish"
        ';

        $mysqli->query($update);
    }

    // timer stop
    if ($_POST['method'] == 'timer_stop' && $Config->CheckToken()) {
        // проверяем состояние таймера
        $select = 'SELECT * FROM billing_timer WHERE id = "' . $_POST['timer_id'] . '"';

        $result = $mysqli->query($select)->fetch_assoc();
        if ($result['status'] === 'stop') return;

        // разнца между стартом и паузой
        if ($result['status'] === 'start') {
            $time_start = new DateTime($result['time_start'], new DateTimeZone($result['timezone']));
            $time_now = new DateTime('now', new DateTimeZone($result['timezone']));
            $time_diff = $time_now->diff($time_start);

            // добавляем разницу к таймеру
            $time_work = new DateTime($result['time_work']);
            $dateInterval = new DateInterval('PT' . $time_diff->h . 'H' . $time_diff->i . 'M' . $time_diff->s . 'S');
            $time_work->add($dateInterval)->format('d.m.Y H:i:s');

            // если разница больше суток, дату ставим 23:59:59 как максимальную
            if ($time_work->format('d.m.Y') !== '01.01.2000') {
                $time_work = new DateTime('01.01.2000 23:59:59');
            }
        } else $time_work = new DateTime($result['time_work']);

        // обновляем состояние таймера
        $update = '
            UPDATE billing_timer
            SET time_start = "",
                status = "stop",
                time_work = "' . $time_work->format('d.m.Y H:i:s') . '"
            WHERE id = "' . $_POST['timer_id'] . '"
        ';

        $mysqli->query($update);
    }

    // timer save
    if ($_POST['method'] == 'timer_save' && $Config->CheckToken()) {
        $select = 'SELECT * FROM billing_timer WHERE id = "' . $_POST['timer_id'] . '"';
        $result = $mysqli->query($select)->fetch_assoc();

        // количество минут с таймера * стоимость сотрудника
        $timestart = '01.01.2000 00:00:00';
        $timefinish = $result['time_work'];
        $minutes = round(abs(strtotime($timestart) - strtotime($timefinish)) / 60);
        $price = $minutes * (int) $_POST['priceManager'];
        // время, затраченное на работу
        $time_work = explode(' ', $result['time_work'])[1];

        // обновляем состояние таймера
        $charset = mb_detect_encoding($_POST['comment']);
        $unicodeString = iconv($charset, "UTF-8", $_POST['comment']);
        $comment = str_ireplace('"', '\"', $unicodeString);

        $update = '
            UPDATE billing_timer
            SET user = "' . $_POST['user'] . '",
                client = "' . $_POST['client'] . '",
                service = "' . $_POST['service'] . '",
                comment = "' . $comment . '",
                price = "' . $price . '",
                time_work = "' . $time_work . '",
                status = "finish"
            WHERE id = "' . $_POST['timer_id'] . '"
        ';

        $mysqli->query($update);

        // обновляем депозит
        $select = 'SELECT * FROM billing_deposit WHERE essence_id = "' . $_POST['essence_id'] . '"';
        $insert = '
                INSERT INTO billing_deposit 
                VALUES(
                null, 
                    "' . $_POST['essence_id'] . '", 
                    0, 
                    ""
            )
        ';

        $result = $mysqli->query($select);
        if (!$result->num_rows) {
            $mysqli->query($insert);
            $result = $mysqli->query($select);
        }

        $result = $result->fetch_assoc();
        $deposit = (int) $result['deposit'] - $price;

        $update = '
            UPDATE billing_deposit 
            SET deposit = "' . $deposit . '" 
            WHERE essence_id = "' . $_POST['essence_id'] . '"
        ';

        $mysqli->query($update);

        // ищем ID сущности в покупателях
        $is_customer = true;

        try {
            $customer = $apiClient->customers()->getOne($_POST['essence_id']);
        } catch (AmoCRMApiException $e) {}

        // если такой сущности нет, ищем в сделках
        if (!$customer) {
            $is_customer = false;

            try {
                $customer = $apiClient->leads()->getOne($_POST['essence_id']);
            } catch (AmoCRMApiException $e) {}
        }

        // если не нашли, выходим
        if (!$customer) return;

        // получаем поля
        $customFields = $customer->getCustomFieldsValues();

        // ищем остаток депозита, иначе создаем со значением 0
        if ($customFields) {
            $field_ID = null;
            $field_type = null;

            foreach ($customFields as $item) {
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
            $customFields = $Config->SetFieldValue($customFields, $field_type, $field_ID, $deposit);

            if ($is_customer) $apiClient->customers()->updateOne($customer);
            else $apiClient->leads()->updateOne($customer);
        }
    }

    /* ##################################################################### */

    // извлекаем список услуг
    if ($_POST['method'] == 'show_services' && $Config->CheckToken()) {
        $select = 'SELECT * FROM billing_services';
        $result = $mysqli->query($select);
        $services = [];
        while ($row = $result->fetch_assoc()) $services[] = [$row['id'], $row['title']];
        echo json_encode($services);
    }

    // обновляем список услуг
    if ($_POST['method'] == 'edit_services' && $Config->CheckToken()) {
        $select = 'SELECT * FROM billing_services';

        $result = $mysqli->query($select);
        $services = [];
        while ($row = $result->fetch_assoc()) $services[] = $row['title'];

        // если нет полученной записи, добавляем
        foreach ($_POST['services'] as $service) {
            if (in_array($service, $services)) continue;
            $insert = 'INSERT INTO billing_services VALUES(null, "' . $service . '")';
            $mysqli->query($insert);
        }

        // если нет существующей записи, удаляем
        foreach ($services as $service) {
            if (in_array($service, $_POST['services'])) continue;
            $delete = 'DELETE FROM billing_services WHERE title = "' . $service . '"';
            $mysqli->query($delete);
        }

        $result = $mysqli->query($select);
        $services = [];
        while ($row = $result->fetch_assoc()) $services[] = [$row['id'], $row['title']];
        echo json_encode($services);
    }

    /* ##################################################################### */

    // получаем сумму депозита
    if ($_POST['method'] == 'get_deposit' && $Config->CheckToken()) {
        $select = 'SELECT * FROM billing_deposit WHERE essence_id = "' . $_POST['essence_id'] . '"';

        $result = $mysqli->query($select);
        if (!$result->num_rows) $deposit = 0;
        else {
            $result = $result->fetch_assoc();
            $deposit = $result['deposit'];
        }

        echo json_encode($deposit);
    }

    // обновляем депозит
    if ($_POST['method'] == 'change_deposit' && $Config->CheckToken()) {
        // добавляем запись с добавлением депозита в таймер
        $tz = $_POST['timezone'];
        $dt = new DateTime('now', new DateTimeZone($tz));
        $dt->setTimestamp(time());

        $insert = '
            INSERT INTO billing_timer
            VALUES(
                null,
                "' . $_POST['essence_id'] . '",
                "' . $_POST['user_id'] . '",
                "Пополнение депозита",
                "",
                "",
                "",
                "' . $_POST['deposit'] . '",
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

        $select = 'SELECT * FROM billing_deposit WHERE essence_id = "' . $_POST['essence_id'] . '"';
        $result = $mysqli->query($select);

        if (!$result->num_rows) {
            $insert = '
                INSERT INTO billing_deposit
                VALUES(
                    null,
                    "' . $_POST['essence_id'] . '",
                    "' . $_POST['deposit_sum'] . '",
                    ""
                )
            ';

            $mysqli->query($insert);
        } else {
            $update = '
                UPDATE billing_deposit
                SET deposit = "' . $_POST['deposit_sum'] . '"
                WHERE essence_id = "' . $_POST['essence_id'] . '"
            ';

            $mysqli->query($update);
        }

        $select = 'SELECT * FROM billing_deposit WHERE essence_id = "' . $_POST['essence_id'] . '"';
        $result = $mysqli->query($select)->fetch_assoc();

        // ищем ID сущности в покупателях
        $is_customer = true;

        try {
            $customer = $apiClient->customers()->getOne($_POST['essence_id']);
        } catch (AmoCRMApiException $e) {}

        // если такой сущности нет, ищем в сделках
        if (!$customer) {
            $is_customer = false;

            try {
                $customer = $apiClient->leads()->getOne($_POST['essence_id']);
            } catch (AmoCRMApiException $e) {}
        }

        // если не нашли, выходим
        if (!$customer) return;

        // получаем поля
        $customFields = $customer->getCustomFieldsValues();

        // ищем остаток депозита, иначе создаем со значением 0
        if ($customFields) {
            $field_ID = null;
            $field_type = null;

            foreach ($customFields as $item) {
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
            $customFields = $Config->SetFieldValue($customFields, $field_type, $field_ID, $_POST['deposit_sum']);

            if ($is_customer) $apiClient->customers()->updateOne($customer);
            else $apiClient->leads()->updateOne($customer);
        }

        echo json_encode($result['deposit']);
    }

    /* ##################################################################### */

    // получаем историю законченных таймеров
    if ($_POST['method'] == 'hystory' && $Config->CheckToken()) {
        $select = '
            SELECT * 
            FROM billing_timer 
            WHERE essence_id = "' . $_POST['essence_id'] . '"
                AND status = "finish"
            ORDER BY id DESC
        ';

        $result = $mysqli->query($select);
        $history = [];

        if (!$result->num_rows) {
            echo json_encode(false);
            return false;
        } else while ($row = $result->fetch_assoc()) $history[] = [
            $row['id'], $row['created_at'], $row['user'], $row['price'], $row['service']
        ];

        echo json_encode($history);
    }

    // получаем историю по ID
    if ($_POST['method'] == 'history_details' && $Config->CheckToken()) {
        $select = 'SELECT * FROM billing_timer WHERE id = "' . $_POST['history_id'] . '"';
        $result = $mysqli->query($select)->fetch_assoc();
        echo json_encode($result);
    }

    // обновление истории по ID
    if ($_POST['method'] == 'edit_history_details' && $Config->CheckToken()) {
        $select_timer = 'SELECT * FROM billing_timer WHERE id = "' . $_POST['history_id'] . '"';
        $result = $mysqli->query($select_timer)->fetch_assoc();

        // проверяем было ли изменено время
        if ($result['time_work'] !== $_POST['time_work']) $is_change_time = true;
        else $is_change_time = false;

        // если время раньше было изменено, оставляем измененным
        if ($result['is_change_time']) $is_change_time = true;

        $new_price = 0;
        if ((int) $result['price'] > (int) $_POST['price']) {
            $new_price += (int) $result['price'] - (int) $_POST['price'];
        } elseif ((int) $result['price'] < (int) $_POST['price']) {
            $new_price -= (int) $_POST['price'] - (int) $result['price'];
        } else $new_price = 0;

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
                price = "' . $_POST['price'] . '",
                time_work = "' . $_POST['time_work'] . '",
                is_change_time = "' . $is_change_time . '"
            WHERE id = "' . $_POST['history_id'] . '"
        ';
        $mysqli->query($update);

        // обновляем сумму депозита
        $select_deposit = 'SELECT * FROM billing_deposit WHERE essence_id = "' . $_POST['essence_id'] . '"';
        $result = $mysqli->query($select_deposit)->fetch_assoc();
        $new_deposit = (int) $result['deposit'] + $new_price;

        $update = '
            UPDATE billing_deposit
            SET deposit = "' . $new_deposit . '"
            WHERE essence_id = "' . $_POST['essence_id'] . '"
        ';
        $mysqli->query($update);

        // ищем ID сущности в покупателях
        $is_customer = true;

        try {
            $customer = $apiClient->customers()->getOne($_POST['essence_id']);
        } catch (AmoCRMApiException $e) {}

        // если такой сущности нет, ищем в сделках
        if (!$customer) {
            $is_customer = false;

            try {
                $customer = $apiClient->leads()->getOne($_POST['essence_id']);
            } catch (AmoCRMApiException $e) {}
        }

        // если не нашли, выходим
        if (!$customer) return;

        // получаем поля
        $customFields = $customer->getCustomFieldsValues();

        // ищем остаток депозита, иначе создаем со значением 0
        if ($customFields) {
            $field_ID = null;
            $field_type = null;

            foreach ($customFields as $item) {
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
            $customFields = $Config->SetFieldValue($customFields, $field_type, $field_ID, $new_deposit);

            if ($is_customer) $apiClient->customers()->updateOne($customer);
            else $apiClient->leads()->updateOne($customer);
        }

        // возвращаем обновленную историю
        $result_timer = $mysqli->query($select_timer)->fetch_assoc();
        $result_deposit = $mysqli->query($select_deposit)->fetch_assoc();
        echo json_encode([$result_timer, $result_deposit['deposit']]);
    }

    // получаем историю по фильтру
    if ($_POST['method'] == 'filter_history' && $Config->CheckToken()) {
        $select = '
            SELECT * 
            FROM billing_timer 
            WHERE essence_id = "' . $_POST['essence_id'] . '"
                AND status = "finish"
            ORDER BY id DESC
        ';
        $result = $mysqli->query($select);
        if (!$result->num_rows) {
            echo json_encode(false);
            return false;
        }

        // соответствие дат добавляем в результирующий массив массив
        $response = [];
        while ($row = $result->fetch_assoc()) {
            $date_from = strtotime(date($_POST['from']));
            $date_to = strtotime(date($_POST['to']));
            $created_at = strtotime(date(explode(' ', $row['created_at'])[0]));

            if ($created_at >= $date_from && $created_at <= $date_to) $response[] = [
                $row['id'], $row['created_at'], $row['user'], $row['price'], $row['price']
            ];
        }

        if (!count($response)) $response = false;
        echo json_encode($response);
    }

    /* ##################################################################### */

    // получаем сумму таймеров сущности
    if ($_POST['method'] == 'get_sum' && $Config->CheckToken()) {
        $select = '
            SELECT SUM(price) AS result__sum 
            FROM billing_timer 
            WHERE essence_id = "' . $_POST['essence_id'] . '"
                AND user != "Пополнение депозита"
        ';

        $result = $mysqli->query($select)->fetch_assoc();
        echo json_encode($result['result__sum']);
    }

    /* ##################################################################### */

    // выгрузка в настройки
    if ($_POST['method'] == 'filter__events' && $Config->CheckToken()) {
        $date_from = null;
        $date_to = null;
        $managers = null;

        // если указана дата
        if ($_POST['filter'] && $_POST['filter']['filter_date']) {
            $date_from = strtotime($_POST['filter']['filter_date']['date_from']);
            $date_to = strtotime($_POST['filter']['filter_date']['date_to']);
        }

        // если указаны менеджеры
        if ($_POST['filter'] && $_POST['filter']['filter_managers'] && count($_POST['filter']['filter_managers']) > 0) {
            $managers = $_POST['filter']['filter_managers'];
        }

        // перебираем данные на предмет совпадений с фильтром
        $select = ' SELECT * FROM billing_timer WHERE status = "finish" ORDER BY id DESC';
        $result = $mysqli->query($select)->fetch_all();

        // если параметры есть, делаем выборку
        if (($date_from && $date_to) || $managers) {
            $items = [];

            foreach ($result as $row) {
                $manager = $row[3];
                $created_at = $row[9];
                $created_at = explode(' ', $created_at)[0];
                $created_at = strtotime($created_at);

                // если есть только дата
                if (($date_from && $date_to) && !count($managers)) {
                    if ($created_at >= $date_from && $created_at <= $date_to) $items[] = $row;

                // если есть только менеджеры
                } else if (!($date_from && $date_to) && count($managers)) {
                    if (in_array($manager, $managers)) $items[] = $row;

                // если есть и дата и менеджеры
                } else if (($date_from && $date_to) && count($managers)) {
                    if (($created_at >= $date_from && $created_at <= $date_to) &&
                        in_array($manager, $managers))
                        $items[] = $row;
                }
            }

            $result = $items;
        }

        print_r(json_encode($result));
    }

    // экспорт в excel
    if ($_POST['method'] == 'export_excel' && $Config->CheckToken()) {
        // создаем документ
        require_once __DIR__ . '/../PHPExcel/Classes/PHPExcel.php';
        require_once __DIR__ . '/../PHPExcel/Classes/PHPExcel/Writer/Excel2007.php';

        $xls = new PHPExcel();
        $file = new DateTime();

        // установка сводки документа
        $xls->getProperties()->setTitle('Экспорт');
        $xls->getProperties()->setCreator('Интегратор');
        $xls->getProperties()->setManager('Гошгар Мехтиев');
        $xls->getProperties()->setCompany('Интегратор групп');
        $xls->getProperties()->setCreated((new DateTime())->format('Y-m-d'));

        // создаем новый лист
        $xls->setActiveSheetIndex(0);
        $sheet = $xls->getActiveSheet();
        $sheet->setTitle('Экспорт');
        $sheet->getPageSetup()->setOrientation(PHPExcel_Worksheet_PageSetup::ORIENTATION_PORTRAIT);

        // запись в ячейки
        $sheet->setCellValue('A1', 'ДАТА');
        $sheet->setCellValue('B1', 'АВТОР');
        $sheet->setCellValue('C1', 'КЛИЕНТ');
        $sheet->setCellValue('D1', 'ВРЕМЯ');
        $sheet->setCellValue('E1', 'КОММЕНТАРИЙ');
        $sheet->setCellValue('F1', 'СТОИМОСТЬ');
        $sheet->setCellValue('G1', 'ОКАЗАННАЯ УСЛУГА');
        $sheet->setCellValue('H1', 'ССЫЛКА НА ЗАДАЧУ');

        // высота строки заголовка
        $sheet->getRowDimension('1')->setRowHeight(30);

        // выравнивание по центру по вертикали
        $sheet->getStyle('A1')->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
        $sheet->getStyle('B1')->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
        $sheet->getStyle('C1')->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
        $sheet->getStyle('D1')->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
        $sheet->getStyle('E1')->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
        $sheet->getStyle('F1')->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
        $sheet->getStyle('G1')->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
        $sheet->getStyle('H1')->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);

        // жирный шрифт
        $sheet->getStyle('A1')->getFont()->setBold(true);
        $sheet->getStyle('B1')->getFont()->setBold(true);
        $sheet->getStyle('C1')->getFont()->setBold(true);
        $sheet->getStyle('D1')->getFont()->setBold(true);
        $sheet->getStyle('E1')->getFont()->setBold(true);
        $sheet->getStyle('F1')->getFont()->setBold(true);
        $sheet->getStyle('G1')->getFont()->setBold(true);
        $sheet->getStyle('H1')->getFont()->setBold(true);

        // если массив не пустой, пишем значения
        if ($_POST['params']['filter_results']) {
            for ($i = 0; $i < count($_POST['params']['filter_results']); $i++) {
                $row = $i + 2;

                if ($_POST['params']['filter_results'][$i]['3'] === 'Пополнение депозита') {
                    $date = explode(' ', $_POST['params']['filter_results'][$i]['9'])[0];
                    $autor = $_POST['params']['filter_results'][$i]['3'];
                    $price = $_POST['params']['filter_results'][$i]['7'];

                    // запись в строку
                    $sheet->setCellValue('A' . $row, $date);
                    $sheet->mergeCells('B' . $row . ':E' . $row);
                    $sheet->setCellValue('B' . $row, $autor);
                    $sheet->setCellValue('F' . $row, $price);

                    // авто переносы строк для столбцов
                    $sheet->getStyle('A' . $row)->getAlignment()->setWrapText(true);
                    $sheet->getStyle('B' . $row)->getAlignment()->setWrapText(true);
                    $sheet->getStyle('F' . $row)->getAlignment()->setWrapText(true);

                    // выравнивание по центру по вертикали
                    $sheet->getStyle('A' . $row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
                    $sheet->getStyle('B' . $row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
                    $sheet->getStyle('F' . $row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);

                    // красим ячейки
                    $bg = array(
                        'fill' => array(
                            'type' => PHPExcel_Style_Fill::FILL_SOLID,
                            'color' => array('rgb' => 'c7efc2')
                        )
                    );

                    $sheet->getStyle('A' . $row)->applyFromArray($bg);
                    $sheet->getStyle('B' . $row)->applyFromArray($bg);
                    $sheet->getStyle('F' . $row)->applyFromArray($bg);
                    $sheet->getStyle('G' . $row)->applyFromArray($bg);
                    $sheet->getStyle('H' . $row)->applyFromArray($bg);

                } else {
                    $date = explode(' ', $_POST['params']['filter_results'][$i]['9'])[0];
                    $autor = $_POST['params']['filter_results'][$i]['3'];
                    $client = $_POST['params']['filter_results'][$i]['4'];
                    $time = $_POST['params']['filter_results'][$i]['12'];
                    $comment = $_POST['params']['filter_results'][$i]['6'];
                    $price = $_POST['params']['filter_results'][$i]['7'];
                    $service = $_POST['params']['filter_results'][$i]['5'];
                    $link = $_POST['params']['filter_results'][$i]['8'];

                    // запись в строку
                    $sheet->setCellValue('A' . $row, $date);
                    $sheet->setCellValue('B' . $row, $autor);
                    $sheet->setCellValue('C' . $row, $client);
                    $sheet->setCellValue('D' . $row, $time);
                    $sheet->setCellValue('E' . $row, $comment);
                    $sheet->setCellValue('F' . $row, $price);
                    $sheet->setCellValue('G' . $row, $service);

                    // ссылка
                    $sheet->setCellValue('H' . $row, $link);
                    $sheet->getCell('H' . $row)->getHyperlink()->setUrl($link);

                    // синий цвет ссылки
                    $sheet->getStyle('H' . $row)->applyFromArray(
                        array('font' => array('color' => array('rgb' => '0000FF')))
                    );

                    // авто переносы строк для столбцов
                    $sheet->getStyle('A' . $row)->getAlignment()->setWrapText(true);
                    $sheet->getStyle('B' . $row)->getAlignment()->setWrapText(true);
                    $sheet->getStyle('C' . $row)->getAlignment()->setWrapText(true);
                    $sheet->getStyle('D' . $row)->getAlignment()->setWrapText(true);
                    $sheet->getStyle('E' . $row)->getAlignment()->setWrapText(true);
                    $sheet->getStyle('F' . $row)->getAlignment()->setWrapText(true);
                    $sheet->getStyle('G' . $row)->getAlignment()->setWrapText(true);
                    $sheet->getStyle('H' . $row)->getAlignment()->setWrapText(true);

                    // выравнивание по центру по вертикали
                    $sheet->getStyle('A' . $row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
                    $sheet->getStyle('B' . $row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
                    $sheet->getStyle('C' . $row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
                    $sheet->getStyle('D' . $row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
                    $sheet->getStyle('E' . $row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
                    $sheet->getStyle('F' . $row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
                    $sheet->getStyle('G' . $row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
                    $sheet->getStyle('H' . $row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
                }
            }

            // общее количество затраченного времени
            $time_row = count($_POST['params']['filter_results']) + 3;
            $all_time = $_POST['params']['filter_all_time'];

            $sheet->mergeCells('A' . $time_row . ':F' . $time_row);
            $sheet->setCellValue('A' . $time_row, 'Общее количество затраченного времени');
            $sheet->setCellValue('G' . $time_row, $all_time);

            // выравнивание по правому краю
            $sheet->getStyle('A' . $time_row)->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_RIGHT);

            // жирный шрифт и курсив
            $sheet->getStyle('A' . $time_row)->getFont()->setBold(true);
            $sheet->getStyle('A' . $time_row)->getFont()->setItalic(true);
            $sheet->getStyle('G' . $time_row)->getFont()->setBold(true);

            // высота строки
            $sheet->getRowDimension($time_row)->setRowHeight(20);

            // выравнивание по центру по вертикали
            $sheet->getStyle('A' . $time_row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
            $sheet->getStyle('G' . $time_row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);

            // общая сумма списания
            $time_row += 1;
            $all_sum = $_POST['params']['filter_all_sum'];

            $sheet->mergeCells('A' . $time_row . ':F' . $time_row);
            $sheet->setCellValue('A' . $time_row, 'Общая сумма списания');
            $sheet->setCellValue('G' . $time_row, $all_sum);

            // выравнивание по правому краю
            $sheet->getStyle('A' . $time_row)->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_RIGHT);

            // жирный шрифт и курсив
            $sheet->getStyle('A' . $time_row)->getFont()->setBold(true);
            $sheet->getStyle('A' . $time_row)->getFont()->setItalic(true);
            $sheet->getStyle('G' . $time_row)->getFont()->setBold(true);

            // высота строки
            $sheet->getRowDimension($time_row)->setRowHeight(20);

            // выравнивание по центру по вертикали
            $sheet->getStyle('A' . $time_row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
            $sheet->getStyle('G' . $time_row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
        }

        // ширина столбцов
        $sheet->getColumnDimension('A')->setWidth(12);
        $sheet->getColumnDimension('B')->setWidth(20);
        $sheet->getColumnDimension('C')->setWidth(20);
        $sheet->getColumnDimension('D')->setWidth(12);
        $sheet->getColumnDimension('E')->setWidth(50);
        $sheet->getColumnDimension('F')->setWidth(14);
        $sheet->getColumnDimension('G')->setWidth(22);
        $sheet->getColumnDimension('H')->setWidth(70);

        // сохраняем в файл
        $file = '/export_billing.xlsx';
        $objWriter = new PHPExcel_Writer_Excel2007($xls);
        $objWriter->save(__DIR__ . $file);

        // размер файла
        if (file_exists('export_billing.xlsx')) {
            $filesize = filesize('export_billing.xlsx');

            function formatFileSize($filesize) {
                $array = array('Б', 'КБ', 'МБ', 'ГБ', 'ТБ');
                $pos = 0;

                while ($filesize >= 1024) {
                    $filesize /= 1024;
                    $pos++;
                }

                return round($filesize,2) . ' ' . $array[$pos];
            }

            $filesize = formatFileSize($filesize);
        }

        // дата, время
        $date = (new DateTime())->format('d.m.Y');
        $time = (new DateTime())->format('H:i');

        print_r(json_encode([
            'count' => count($_POST['params']['filter_results']),
            'filesize' => $filesize,
            'date' => $date,
            'time' => $time
        ]));
    }