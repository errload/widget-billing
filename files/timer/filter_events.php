<?php

    $date_from = null;
    $date_to = null;
    $managers = null;
    $results = [];
    $all_sum = 0;

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
    $results = $mysqli->query($select)->fetch_all();

    // если параметры есть, делаем выборку
    if (($date_from && $date_to) || $managers) {
        $items = [];

        foreach ($results as $row) {
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

        $results = $items;

        // общая сумма списания и общее количество затраченного времени
        $all_time = strtotime('01.01.2000 00:00:00');
        $item_time = 0;

        foreach ($results as $item) {
            if ($item[3] === 'Пополнение депозита') continue;

            $all_sum += (int) $item[7];

            $item_time = strtotime('01.01.2000 ' . $item[12]);
            $diff_time = $item_time - strtotime('01.01.2000 00:00:00');
            $all_time += $diff_time;
        }

        $all_sum = $all_sum . ' р.';

        // считаем часы
        $all_time = date('d.m.Y H:i:s', $all_time);
        $all_time = new DateTime($all_time);

        // если секунд больше 30, прибавляем минуту
        if ((int) $all_time->format('s') > 30) {
            $all_time = strtotime($all_time->format('d.m.Y H:i:s'));
            $all_time = date('d.m.Y H:i:s', strtotime('+1 minutes', $all_time));
            $all_time = new DateTime($all_time);
        }

        $h = $all_time->format('H');
        $i = $all_time->format('i');

        // если прошло более суток, к часам прибавляем по 24 за день (минус 24 за первый день)
        if ((int) $all_time->format('d') > 1) $h += (((int) $all_time->format('d') * 24) - 24);

        // если первый символ в часах или минутах 0, обрезаем
        if ($h[0] == '0') $h = mb_substr($h, 1);
        if ($i[0] == '0') $i = mb_substr($i, 1);

        $all_time = $h . ' ч. ' . $i . ' мин.';
    }

    print_r(json_encode(['results' => $results, 'all_sum' => $all_sum, 'all_time' => $all_time]));
