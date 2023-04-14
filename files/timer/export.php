<?php

    // создаем документ
    require_once __DIR__ . '/../../PHPExcel/Classes/PHPExcel.php';
    require_once __DIR__ . '/../../PHPExcel/Classes/PHPExcel/Writer/Excel2007.php';

    $xls = new PHPExcel();
    $file = new DateTime();

    // установка сводки документа
    $xls->getProperties()->setTitle('Экспорт таймеров');
    $xls->getProperties()->setCreator('Интегратор');
    $xls->getProperties()->setManager('Гошгар Мехтиев');
    $xls->getProperties()->setCompany('Интегратор групп');
    $xls->getProperties()->setCreated((new DateTime())->format('Y-m-d'));

    // создаем новый лист
    $xls->setActiveSheetIndex(0);
    $sheet = $xls->getActiveSheet();
    $sheet->setTitle('Экспорт таймеров');
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

    $results = [];


    if ($_POST['IDs']) {
        $row = 1;
        $all_sum = 0;
        $all_time = strtotime('01.01.2000 00:00:00');
        $item_time = 0;

        foreach ($_POST['IDs'] as $item) {
            $select = 'SELECT * FROM billing_timer WHERE id = "' . (int)$item . '"';
            $result = $mysqli->query($select)->fetch_assoc();
            $row++;

            if ($result['user'] === 'Пополнение депозита') {
                $date = explode(' ', $result['created_at'])[0];
                $autor = $result['user'];
                $price = $result['price'];

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
                $date = explode(' ', $result['created_at'])[0];
                $autor = $result['user'];
                $client = $result['client'];
                $time_work = $result['time_work'];
                $comment = $result['comment'];
                $price = $result['price'];
                $service = $result['service'];
                $link_task = $result['link_task'];

                // запись в строку
                $sheet->setCellValue('A' . $row, $date);
                $sheet->setCellValue('B' . $row, $autor);
                $sheet->setCellValue('C' . $row, $client);
                $sheet->setCellValue('D' . $row, $time_work);
                $sheet->setCellValue('E' . $row, $comment);
                $sheet->setCellValue('F' . $row, $price);
                $sheet->setCellValue('G' . $row, $service);

                // ссылка
                $sheet->setCellValue('H' . $row, $link_task);
                $sheet->getCell('H' . $row)->getHyperlink()->setUrl($link_task);

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

                // общая сумма списания и общее количество затраченного времени
                $all_sum += (int) $price;

                $item_time = strtotime('01.01.2000 ' . $time_work);
                $diff_time = $item_time - strtotime('01.01.2000 00:00:00');
                $all_time += $diff_time;
            }
        }

        // общая сумма списания и общее количество затраченного времени
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

        // общее количество затраченного времени
        $row = count($_POST['IDs']) + 3;

        $sheet->mergeCells('A' . $row . ':F' . $row);
        $sheet->setCellValue('A' . $row, 'Общее количество затраченного времени');
        $sheet->setCellValue('G' . $row, $all_time);

        // выравнивание по правому краю
        $sheet->getStyle('A' . $row)->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_RIGHT);

        // жирный шрифт и курсив
        $sheet->getStyle('A' . $row)->getFont()->setBold(true);
        $sheet->getStyle('A' . $row)->getFont()->setItalic(true);
        $sheet->getStyle('G' . $row)->getFont()->setBold(true);

        // высота строки
        $sheet->getRowDimension($row)->setRowHeight(20);

        // выравнивание по центру по вертикали
        $sheet->getStyle('A' . $row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
        $sheet->getStyle('G' . $row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);

        // общая сумма списания
        $row += 1;

        $sheet->mergeCells('A' . $row . ':F' . $row);
        $sheet->setCellValue('A' . $row, 'Общая сумма списания');
        $sheet->setCellValue('G' . $row, $all_sum);

        // выравнивание по правому краю
        $sheet->getStyle('A' . $row)->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_RIGHT);

        // жирный шрифт и курсив
        $sheet->getStyle('A' . $row)->getFont()->setBold(true);
        $sheet->getStyle('A' . $row)->getFont()->setItalic(true);
        $sheet->getStyle('G' . $row)->getFont()->setBold(true);

        // высота строки
        $sheet->getRowDimension($row)->setRowHeight(20);

        // выравнивание по центру по вертикали
        $sheet->getStyle('A' . $row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
        $sheet->getStyle('G' . $row)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
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
    $file = '/../export_timers.xlsx';
    $objWriter = new PHPExcel_Writer_Excel2007($xls);
    $objWriter->save(__DIR__ . $file);

    // размер файла
    if (file_exists(__DIR__ . $file)) {
        $filesize = filesize(__DIR__ . $file);

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

    if (!$_POST['IDs'] || !count($_POST['IDs'])) $count = 0;
    else $count = count($_POST['IDs']);

    print_r(json_encode([
        'count' => $count,
        'filesize' => $filesize,
        'date' => $date,
        'time' => $time,
        'results' => $results
    ]));
