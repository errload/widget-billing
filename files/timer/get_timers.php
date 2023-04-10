<?php

    $select = '
        SELECT * 
        FROM billing_timer 
        WHERE user_id = "' . $_POST['user_ID'] . '" 
            AND essence_id = "' . $_POST['essence_ID'] . '"
            AND status != "finish"
    ';

    $result = $mysqli->query($select);

    if (!$result->num_rows) {
        echo json_encode(false);
        return false;
    }

    $results = $result->fetch_all();

    foreach ($results as $key => $result) {

        if ($result[13] === 'start') {
            // разнца между стартом и паузой
            $time_start = new DateTime($result[11], new DateTimeZone($result[10]));
            $time_now = new DateTime('now', new DateTimeZone($result[10]));
            $time_diff = $time_now->diff($time_start);

            // добавляем разницу к таймеру
            $time_work = new DateTime($result[12]);
            $dateInterval = new DateInterval('PT' . $time_diff->h . 'H' . $time_diff->i . 'M' . $time_diff->s . 'S');
            $time_work->add($dateInterval)->format('d.m.Y H:i:s');

        } else $time_work = new DateTime($result[12]);

        // если разница больше суток, дату ставим 23:59:59 как максимальную
        if ($time_work->format('d.m.Y') !== '01.01.2000') {
            $time_work = new DateTime('01.01.2000 23:59:59');

            // обновляем время таймера
            $update = '
                UPDATE billing_timer
                SET time_start = "",
                    time_work = "' . $time_work->format('d.m.Y H:i:s') . '",
                    status = "stop"
                WHERE id = "' . $result[0] . '"
            ';

            $mysqli->query($update);
        }

        // новое значение времени
        $results[$key][12] = $time_work->format('d.m.Y H:i:s');
    }

    print_r(json_encode($results));
