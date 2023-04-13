<?php

    $result_sum = [];
    $result_date = [];
    $result = 0;
    $dt = strtotime((new DateTime('-30 days'))->format('d.m.Y'));

    // поиск полученных ID
    foreach ($_POST['IDs'] as $ID) {
        $select = 'SELECT * FROM billing_timer WHERE id = "' . $ID . '"';
        $results = $mysqli->query($select)->fetch_assoc();

        // если дате больше 30 дней, пропускаем
        $created_at = strtotime(explode(' ', $results['created_at'])[0]);
        if ($created_at < $dt) continue;

        // разбиваем записи по датам
        $result_date[$created_at][] = $results['price'];
    }

    // подсчет среднего расхода за каждую дату
    foreach ($result_date as $date) {
        $sum = 0;

        foreach ($date as $item) {
            $sum += $item;
        }

        if ($sum !== 0) $sum = round($sum / count($date), 0);
        $result_sum[] = $sum;
    }

    // подсчет среднего расхода за 30 дней
    foreach ($result_sum as $item) { $result += (int) $item; }
    if ($sum !== 0) $result = round($result / 30, 2);

    print_r(json_encode($result));
