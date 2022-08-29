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
        if ($Config->CheckToken()) echo true;
        else echo false;
    }

    // получаем ссылку на проект
    if ($_POST['method'] == 'link_project' && $Config->CheckToken()) {
        $select = 'SELECT * FROM billing_deposit WHERE essence_id="' . $_POST['essence_id'] . '"';

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
        $select = 'SELECT * FROM billing_deposit WHERE essence_id="' . $_POST['essence_id'] . '"';
        $update = 'UPDATE billing_deposit SET link_project="' . $_POST['link_project'] . '" WHERE essence_id="' . $_POST['essence_id'] . '"';
        $insert = 'INSERT INTO billing_deposit VALUES(null, "' . $_POST['essence_id'] . '", 0, "' . $_POST['link_project'] . '")';

        $result = $mysqli->query($select);
        if (!$result->num_rows) $mysqli->query($insert);
        else $mysqli->query($update);
        $result = $mysqli->query($select)->fetch_array();

        echo json_encode($result['link_project']);
    }

    // получаем ссылку на задачу
    if ($_POST['method'] == 'link_task' && $Config->CheckToken()) {
        $select = 'SELECT * FROM billing_timer WHERE user_id="' . $_POST['user_id'] . '" AND essence_id="' . $_POST['essence_id'] . '"';

        $result = $mysqli->query($select);
        if (!$result->num_rows) $result = '';
        else {
            $result = $result->fetch_array();
            $result = $result['link_task'];
        }

        echo json_encode($result);
    }

    // данные таймера
    if ($_POST['method'] == 'timer' && $Config->CheckToken()) {
        // текущее время
        $tz = $_POST['timezone'];
        $timestamp = time();
        $dt = new DateTime('now', new DateTimeZone($tz));
        $dt->setTimestamp($timestamp);

        $select = 'SELECT * FROM billing_timer WHERE user_id="' . $_POST['user_id'] . '" AND essence_id="' . $_POST['essence_id'] . '"';
        $result = $mysqli->query($select);
        if (!$result->num_rows) echo false;
        $result = $mysqli->query($select)->fetch_assoc();

        // получаем разницу с момента старта таймера
        $time_start = new DateTime($result['time_start'], new DateTimeZone($result['timezone']));
        $time_now = new DateTime('now', new DateTimeZone($result['timezone']));
        $time_work = $time_now->diff($time_start);
        $time_work = $time_work->h . ':' . $time_work->i . ':' . $time_work->s;

        // обновляем время и продолжаем таймер
        $update = 'UPDATE billing_timer SET time_work="' . $time_work . '"
            WHERE essence_id="' . $_POST['essence_id'] . '" AND user_id = "' . $_POST['user_id'] . '"';
        $result = $mysqli->query($update);
        $result = $mysqli->query($select)->fetch_assoc();

        echo json_encode($result);
    }

    // запускаем таймер
    if ($_POST['method'] == 'timer_start' && $Config->CheckToken()) {
        $tz = $_POST['timezone'];
        $timestamp = time();
        $dt = new DateTime('now', new DateTimeZone($tz));
        $dt->setTimestamp($timestamp);

        $select = 'SELECT * FROM billing_timer WHERE user_id="' . $_POST['user_id'] . '" AND essence_id="' . $_POST['essence_id'] . '"';
        $update = 'UPDATE billing_timer SET link_project="' . $_POST['link_project'] . '" WHERE essence_id="' . $_POST['essence_id'] . '"';
        $insert = 'INSERT INTO billing_timer VALUES(
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
            "",
            "00:00:00",
            "start"
        )';

        // находим нужную запись
        $result = $mysqli->query($select);
        // если не существует, создаем
        if (!$result->num_rows) $mysqli->query($insert);
        // иначе обновляем
        else $mysqli->query($update);
        // возвращаем актуальную ссылку
        $result = $mysqli->query($select)->fetch_assoc();

        echo json_encode($result);
    }

// получаем данные истории таймера
//    if ($_POST['method'] == 'hystory' && $Config->CheckToken()) {
//        $essence_id = $_POST['essence_id'];
//        $response = [];
//
//        if ($result = $mysqli->query('SELECT * FROM billing_deposit WHERE essence_id="' . $essence_id . '"')) {
//            $result = $result->fetch_array();
//            $response['deposit'] = $result['deposit'];
//        }
//
//        if ($result = $mysqli->query('SELECT * FROM billing_timer WHERE essence_id="' . $essence_id . '"')) {
//            while ($row = $result->fetch_assoc()) $response['history'][] = $row;
//        }
//
//        echo json_encode($response);
//    }

    // обновляем сумму депозита
//    if ($_POST['method'] == 'change_deposit' && $Config->CheckToken()) {
//        $select = 'SELECT * FROM billing_deposit WHERE essence_id="' . $_POST['essence_id'] . '"';
//        $update = 'UPDATE billing_deposit SET deposit="' . $_POST['deposit'] . '" WHERE essence_id="' . $_POST['essence_id'] . '"';
//        $insert = 'INSERT INTO billing_deposit VALUES(null, "' . $_POST['essence_id'] . '", "' . $_POST['deposit'] . '", "")';
//
//        // находим нужную запись
//        $result = $mysqli->query($select);
//        // если не существует, создаем
//        if (!$result->num_rows) $mysqli->query($insert);
//        // иначе обновляем
//        else $mysqli->query($update);
//        // возвращаем актуальный депозит
//        $result = $mysqli->query($select)->fetch_array();
//
//        echo json_encode($result['deposit']);
//    }

    // сохраняем таймер
//    if ($_POST['method'] == 'save_timer' && $Config->CheckToken()) {
//        $insert_timer = 'INSERT INTO billing_timer VALUES(
//             null,
//             "' . $_POST['essence_id'] . '",
//             "' . $_POST['user'] . '",
//             "' . $_POST['client'] . '",
//             "' . $_POST['service'] . '",
//             "' . $_POST['comment'] . '",
//             "' . $_POST['price'] . '",
//             "' . $_POST['link_task'] . '",
//             "' . date('d.m.Y') . '"
//         )';
//        $insert_deposit = 'INSERT INTO billing_deposit VALUES(null, "' . $_POST['essence_id'] . '", 0, "")';
//        $select = 'SELECT * FROM billing_deposit WHERE essence_id="' . $_POST['essence_id'] . '"';
//
//        // сохраняем таймер
//        $mysqli->query($insert_timer);
//
//        // обновляем депозит таймера
//        $result = $mysqli->query($select);
//        if (!$result->num_rows) {
//            $mysqli->query($insert_deposit);
//            $result = $mysqli->query($select);
//        }
//        $result = $result->fetch_array();
//
//        $deposit = (int) $result['deposit'];
//        $price = (int) $_POST['price'];
//        $deposit = $deposit - $price;
//
//        $update = 'UPDATE billing_deposit SET deposit="' . $deposit . '" WHERE essence_id="' . $_POST['essence_id'] . '"';
//        $mysqli->query($update);
//    }
