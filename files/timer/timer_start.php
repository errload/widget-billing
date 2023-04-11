<?php

    $select = '
        SELECT *
        FROM billing_timer
        WHERE user_id = "' . $_POST['user_ID'] . '"
            AND essence_id = "' . $_POST['essence_ID'] . '"
            AND status = "start"
    ';

    $results = $mysqli->query($select)->fetch_all();

    if (count($results)) {
        // ставим запущенные таймеры на паузу
        foreach ($results as $result) {
            // разнца между стартом и паузой
            $time_start = new DateTime($result[11], new DateTimeZone($result[10]));
            $time_now = new DateTime('now', new DateTimeZone($result[10]));
            $time_diff = $time_now->diff($time_start);

            // добавляем разницу к таймеру
            $time_work = new DateTime($result[12]);
            $date_interval = new DateInterval('PT' . $time_diff->h . 'H' . $time_diff->i . 'M' . $time_diff->s . 'S');
            $time_work->add($date_interval)->format('d.m.Y H:i:s');

            // если разница больше суток, дату ставим 23:59:59 как максимальную
            if ($time_work->format('d.m.Y') !== '01.01.2000') {
                $time_work = new DateTime('01.01.2000 23:59:59');
            }

            $update = '
                UPDATE billing_timer
                SET time_start = "",
                    status = "pause",
                    time_work = "' . $time_work->format('d.m.Y H:i:s') . '"
                WHERE id = "' . $result[0] . '"
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
                "' . $_POST['essence_ID'] . '",
                "' . $_POST['user_ID'] . '",
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
