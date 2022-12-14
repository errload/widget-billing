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

    /* ##################################################################### */

    $hostname = 'localhost';
    $username = 'n108089_andreev';
    $password = 'ZUCzh$bm5i24M#pN';
    $database = 'n108089_andreev';

    $mysqli = new mysqli($hostname, $username, $password, $database);
    if ($mysqli->connect_errno) die($mysqli->connect_error);
    mysqli_set_charset($mysqli, 'utf8');

    /* ##################################################################### */

    // проверка авторизации для запуска таймера
    if ($_POST['method'] == 'isAuth') {
        if ($Config->CheckToken()) echo json_encode(true);
        else echo json_encode(false);
    }

    /* ##################################################################### */

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

    // получаем ссылку на задачу
    if ($_POST['method'] == 'link_task' && $Config->CheckToken()) {
        $select = '
            SELECT * 
            FROM billing_timer 
            WHERE user_id = "' . $_POST['user_id'] . '" 
                AND essence_id = "' . $_POST['essence_id'] . '"
                AND status != "finish"
        ';

        $result = $mysqli->query($select);
        if (!$result->num_rows) $result = '';
        else {
            $result = $result->fetch_array();
            $result = $result['link_task'];
        }

        echo json_encode($result);
    }

    /* ##################################################################### */

    // данные таймера
    if ($_POST['method'] == 'timer' && $Config->CheckToken()) {
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
        $result = $result->fetch_assoc();

        if ($result['status'] === 'start') {
            // разнца между стартом и паузой
            $time_start = new DateTime($result['time_start'], new DateTimeZone($result['timezone']));
            $time_now = new DateTime('now', new DateTimeZone($result['timezone']));
            $time_diff = $time_now->diff($time_start);

            // добавляем разницу к таймеру
            $time_work = new DateTime($result['time_work']);
            $dateInterval = new DateInterval('PT' . $time_diff->h . 'H' . $time_diff->i . 'M' . $time_diff->s . 'S');
            $time_work->add($dateInterval)->format('d.m.Y H:i:s');
        } else $time_work = new DateTime($result['time_work']);

        // если разница больше суток, дату ставим 23:59:59 как максимальную
        if ($time_work->format('d.m.Y') !== '01.01.2000') {
            $time_work = new DateTime('01.01.2000 23:59:59');

            // обновляем время таймера
            $update = '
                UPDATE billing_timer
                SET time_start = "",
                    time_work = "' . $time_work->format('d.m.Y H:i:s') . '",
                    status = "stop"
                WHERE essence_id = "' . $_POST['essence_id'] . '"
                    AND user_id = "' . $_POST['user_id'] . '"
                    AND status != "finish"
            ';
            $mysqli->query($update);
        }

        $result = $mysqli->query($select)->fetch_assoc();
        echo json_encode(['time_work' => $time_work->format('d.m.Y H:i:s'), 'status' => $result['status']]);
    }

    // timer start
    if ($_POST['method'] == 'timer_start' && $Config->CheckToken()) {
        // текущее время
        $tz = $_POST['timezone'];
        $dt = new DateTime('now', new DateTimeZone($tz));
        $dt->setTimestamp(time());

        $select = '
            SELECT * 
            FROM billing_timer 
            WHERE user_id = "' . $_POST['user_id'] . '" 
                AND essence_id = "' . $_POST['essence_id'] . '"
                AND status != "finish"
        ';
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
                "start"
            )
        ';

        $result = $mysqli->query($select);
        if (!$result->num_rows) {
            $mysqli->query($insert);
            $result = $mysqli->query($select);
        }
        $result = $result->fetch_assoc();

        // обновляем время старта
        $update = '
            UPDATE billing_timer
            SET time_start = "' . $dt->format('d.m.Y H:i:s') . '",
                status = "start"
            WHERE essence_id = "' . $_POST['essence_id'] . '"
                AND user_id = "' . $_POST['user_id'] . '"
                AND status != "finish"
        ';

        $mysqli->query($update);
        $result = $mysqli->query($select)->fetch_assoc();

        echo json_encode($result);
    }

    // timer auto stop
    if ($_POST['method'] == 'stop_auto_stop' && $Config->CheckToken()) {
        // обновляем время старта
        $update = '
                UPDATE billing_timer
                SET time_start = "",
                    status = "stop",
                    time_work = "01.01.2000 23:59:59"
                WHERE essence_id = "' . $_POST['essence_id'] . '"
                    AND user_id = "' . $_POST['user_id'] . '"
                    AND status != "finish"
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
                AND status != "finish"
        ';

        $mysqli->query($update);
    }

    // timer stop
    if ($_POST['method'] == 'timer_stop' && $Config->CheckToken()) {
        // проверяем состояние таймера
        $select = '
            SELECT * 
            FROM billing_timer 
            WHERE user_id = "' . $_POST['user_id'] . '" 
                AND essence_id = "' . $_POST['essence_id'] . '"
                AND status != "finish"
        ';
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
            WHERE essence_id = "' . $_POST['essence_id'] . '"
                AND user_id = "' . $_POST['user_id'] . '"
                AND status != "finish"
        ';

        $mysqli->query($update);
    }

    // timer save
    if ($_POST['method'] == 'timer_save' && $Config->CheckToken()) {
        $select = '
            SELECT * 
            FROM billing_timer 
            WHERE user_id = "' . $_POST['user_id'] . '" 
                AND essence_id = "' . $_POST['essence_id'] . '"
                AND status != "finish"
        ';
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
            WHERE essence_id = "' . $_POST['essence_id'] . '"
                AND user_id = "' . $_POST['user_id'] . '"
                AND status != "finish"
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
        $select = 'SELECT * FROM billing_deposit WHERE essence_id = "' . $_POST['essence_id'] . '"';
        $update = '
            UPDATE billing_deposit 
            SET deposit = "' . $_POST['deposit'] . '" 
            WHERE essence_id = "' . $_POST['essence_id'] . '"
        ';
        $insert = '
            INSERT INTO billing_deposit 
            VALUES(
                null, 
                "' . $_POST['essence_id'] . '", 
                "' . $_POST['deposit'] . '", 
                ""
            )
        ';

        $result = $mysqli->query($select);
        if (!$result->num_rows) $mysqli->query($insert);
        else $mysqli->query($update);
        $result = $mysqli->query($select)->fetch_array();

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
            $row['id'], $row['created_at'], $row['user'], $row['price']
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
                price = "' . $_POST['price'] . '"
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
        ';

        $result = $mysqli->query($select)->fetch_assoc();
        echo json_encode($result['result__sum']);
    }
