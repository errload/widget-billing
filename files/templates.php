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
        if ($Config->CheckToken()) echo json_encode('true');
        else echo json_encode('false');
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
    if ($_POST['method'] == 'timer_start' && $Config->CheckToken()) include 'timer/timer_start.php';
    // авто стоп таймера
    if ($_POST['method'] == 'timer_auto_stop' && $Config->CheckToken()) include 'timer/timer_auto_stop.php';
    // пауза таймера
    if ($_POST['method'] == 'timer_pause' && $Config->CheckToken()) include 'timer/timer_pause.php';
    // стоп таймера
    if ($_POST['method'] == 'timer_stop' && $Config->CheckToken()) include 'timer/timer_stop.php';
    // сохранение таймера
    if ($_POST['method'] == 'timer_save' && $Config->CheckToken()) include 'timer/timer_save.php';

    /* ************************************************************** */

    // получение контактов сущности
    if ($_POST['method'] == 'get_clients' && $Config->CheckToken()) include 'timer/get_clients.php';
    // получение списка услуг
    if ($_POST['method'] == 'get_services' && $Config->CheckToken()) include 'timer/get_services.php';
    // обновление списка услуг
    if ($_POST['method'] == 'update_services' && $Config->CheckToken()) include 'timer/update_services.php';

    /* ************************************************************** */

    // получаем депозит
    if ($_POST['method'] == 'get_deposit' && $Config->CheckToken()) include 'timer/get_deposit.php';
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
    // обновление истории
    if ($_POST['method'] == 'update_history' && $Config->CheckToken()) include 'timer/update_history.php';

    /* ************************************************************** */

    // поиск запущенных таймеров для меню
    if ($_POST['method'] == 'search_timers' && $Config->CheckToken()) include 'timer/search_timers.php';

    /* ************************************************************** */

    // выгрузка фильтра
    if ($_POST['method'] == 'filter_events' && $Config->CheckToken()) include 'timer/filter_events.php';

    /* ************************************************************** */

    // экспорт фильтра
    if ($_POST['method'] == 'export' && $Config->CheckToken()) include 'timer/export.php';
