// billing
define(['jquery', 'underscore', 'twigjs', 'lib/components/base/modal'], function($, _, Twig, Modal) {
    var CustomWidget_WidgetBilling = function() {
        var self = this,
            system = self.system,
            url_link_t = 'https://integratorgroup.k-on.ru/andreev/billing/templates.php';

        // настройки прав доступа, стоимость сотрудника
        this.config_settings = {};
        this.userID = AMOCRM.constant('user').id;

        // получение настроек
        this.getConfigSettings = function () {
            var config_settings = self.get_settings().config_settings || {};
            if (typeof config_settings !== 'string') config_settings = JSON.stringify(config_settings);
            config_settings = JSON.parse(config_settings);
            self.config_settings = config_settings;
        }

        // сохранение настроек
        this.saveConfigSettings = function () {
            $(`#${ self.get_settings().widget_code }_custom`).val(JSON.stringify(self.config_settings));
            $(`#${ self.get_settings().widget_code }_custom`).trigger('change');
        }

        // очищаем интервалы
        this.clearIntervals = function () {
            var maxInterval = setInterval(() => {}, 1);
            for (var i = 0; i < maxInterval; i++) clearInterval(i);
        }

        // детальный просмотр истории таймера
        this.showDetails = function (e) {
            var historyID = $(e.target).attr('data-id');
            if (!historyID) historyID = $(e.target).closest('.link__details').attr('data-id');

            new Modal({
                class_name: 'hystory__details',
                init: function ($modal_body) {
                    var $this = $(this);
                    $modal_body
                        .trigger('modal:loaded')
                        .html(`
                            <div class="modal__hystory__details" data-id="${ historyID }" style="width: 100%; min-height: 550px;">
                                <h2 class="modal-body__caption head_2">Детализация</h2>
                            </div>
                        `)
                        .trigger('modal:centrify')
                        .append('');
                },
                destroy: function () {}
            });

            /* ###################################################################### */

            // добавляем элементы истории
            const addHistoryItem = function (title, value, class_item = '') {
                var historyItem = `
                    <div class="flex__history" style="
                        display: flex;
                        flex-direction: row;
                        background: #fcfcfc;
                        border-top: 1px solid #dbdedf;
                        border-bottom: 1px solid #dbdedf;
                        margin-bottom: 2px;
                    ">
                        <div class="title title__${ class_item }" style="
                            width: 200px; text-align: right; padding: 10px; color: #92989b;">
                            ${ title }
                        </div>
                        <div class="value ${ class_item }" style="width: 100%; padding: 10px 10px 10px 0;">
                            ${ value }
                        </div>
                    </div>
                `;
                $('.modal__hystory__details').append(historyItem);
            }

            $.ajax({
                url: url_link_t,
                method: 'post',
                data: {
                    'domain': document.domain,
                    'method': 'history_details',
                    'history_id': historyID
                },
                dataType: 'json',
                success: function (data) {
                    addHistoryItem('Дата таймера', data.created_at.split(' ')[0] + 'г.');
                    addHistoryItem('Ответственный', data.user, 'user__details__item');
                    addHistoryItem('Имя клиента', data.client, 'client__details__item');
                    addHistoryItem('Оказанная услуга', data.service, 'service__details__item');
                    addHistoryItem('Комментарий', data.comment, 'comment__details__item');
                    addHistoryItem('Стоимость работы', data.price + 'р.', 'price__details__item');
                    addHistoryItem('Ссылка на задачу', `
                        <a href="${ data.link_task }" target="_blank" style="
                            text-decoration: none; color: #1375ab; word-break: break-all;
                        ">${ data.link_task }</a>                                    
                    `, 'link__task__details__item');
                    addHistoryItem('Время работы', data.time_work);

                    /* ###################################################################### */

                    // права на редактирование истории
                    if (rights && rights.includes('isEditHistory')) {
                        // кнопки Редактировать, Сохранить
                        var editBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                                class_name: 'modal__editBtn__details',
                                text: 'Редактировать'
                            }),
                            saveEditBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                                class_name: 'modal__saveEditBtn__details',
                                text: 'Сохранить'
                            }),
                            editBtnWrapper = `<div class="modal__body__actions__details" style="width: 100%;"></div>`;

                        $('.modal__hystory__details').append(editBtnWrapper);
                        $('.modal__body__actions__details').append(editBtn);
                        $('.modal__body__actions__details').append(saveEditBtn);
                        $('.modal__saveEditBtn__details').css('display', 'none');
                        $('.modal__body__actions__details').css('margin-top', '10px');

                        /* ###################################################################### */

                        // редактирование истории
                        $('.modal__editBtn__details').unbind('click');
                        $('.modal__editBtn__details').bind('click', function () {
                            $('.modal__editBtn__details').css('display', 'none');
                            $('.modal__saveEditBtn__details').css('display', 'block');

                            const toEdit = function (class_text, class_input, name_input, value, placeholder) {
                                var input = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                                    name: name_input,
                                    class_name: class_input,
                                    value: '',
                                    placeholder: placeholder
                                });

                                $(`.${ class_text }`).text('');
                                $(`.${ class_text }`).append(input);
                                $(`.${ class_input }`).val(value);
                                $(`.${ class_input }`).css('width', '100%');
                                $(`.title__${ class_text }`).css('padding-top', '19px');
                            }

                            // ответственный
                            toEdit(
                                'user__details__item',
                                'modal__input__user__edit__details',
                                'modal-input-client-edit-details',
                                $('.user__details__item').text().trim(),
                                'введите имя ответственного'
                            );

                            // имя клиента
                            toEdit(
                                'client__details__item',
                                'modal__input__client__edit__details',
                                'modal-input-client-edit-details',
                                $('.client__details__item').text().trim(),
                                'введите имя клиента'
                            );

                            // оказанная услуга
                            toEdit(
                                'service__details__item',
                                'modal__input__service__edit__details',
                                'modal-input-service-edit-details',
                                $('.service__details__item').text().trim(),
                                'введите оказанную услугу'
                            );

                            var textarea = Twig({ ref: '/tmpl/controls/textarea.twig' }).render({
                                name: 'modal-textarea-comment-edit-details',
                                class_name: 'modal__textarea__comment__edit__details',
                                placeholder: 'введите комментарий'
                            });
                            var text = $('.comment__details__item').text().trim();
                            $('.comment__details__item').text('');
                            $('.comment__details__item').append(textarea);
                            $('.modal__textarea__comment__edit__details').val(text);
                            $('.modal__textarea__comment__edit__details').css('width', '100%');
                            $('.title__comment__details__item').css('padding-top', '19px');

                            // стоимость работы
                            toEdit(
                                'price__details__item',
                                'modal__input__price__edit__details',
                                'modal-input-price-edit-details',
                                $('.price__details__item').text().trim().slice(0, -2),
                                'введите стоимость работы'
                            );
                            $('.modal__input__price__edit__details').attr('type', 'number');

                            // ссылка на задачу
                            toEdit(
                                'link__task__details__item',
                                'modal__input__link__task__edit__details',
                                'modal-input-link__task-edit-details',
                                $('.link__task__details__item').text().trim(),
                                'введите ссылку на задачу'
                            );
                        });

                        /* ###################################################################### */

                        // сохранение истории
                        $('.modal__saveEditBtn__details').unbind('click');
                        $('.modal__saveEditBtn__details').bind('click', function () {
                            var user = $('.modal__input__user__edit__details');
                            var client = $('.modal__input__client__edit__details');
                            var service = $('.modal__input__service__edit__details');
                            var comment = $('.modal__textarea__comment__edit__details');
                            var price = $('.modal__input__price__edit__details');
                            var link_task = $('.modal__input__link__task__edit__details');
                            var isError = false;

                            // красим поля в случае ошибки
                            if (!link_task.val().trim().length) {
                                link_task.val('').focus();
                                isError = true;
                                $('.modal__input__link__task__edit__details').css('border-color', '#f37575');
                            }
                            // возвращаем естесственные цвета
                            $('.modal__input__link__task__edit__details').unbind('change');
                            $('.modal__input__link__task__edit__details').bind('change', function () {
                                $('.modal__input__link__task__edit__details').css('border-color', '#dbdedf');
                            });

                            if (!price.val().trim().length) {
                                price.val('').focus();
                                isError = true;
                                $('.modal__input__price__edit__details').css('border-color', '#f37575');
                            }
                            // возвращаем естесственные цвета
                            $('.modal__input__price__edit__details').unbind('change');
                            $('.modal__input__price__edit__details').bind('change', function () {
                                $('.modal__input__price__edit__details').css('border-color', '#dbdedf');
                            });

                            if (!service.val().trim().length) {
                                service.val('').focus();
                                isError = true;
                                $('.modal__input__service__edit__details').css('border-color', '#f37575');
                            }
                            // возвращаем естесственные цвета
                            $('.modal__input__service__edit__details').unbind('change');
                            $('.modal__input__service__edit__details').bind('change', function () {
                                $('.modal__input__service__edit__details').css('border-color', '#dbdedf');
                            });

                            if (!client.val().trim().length) {
                                client.val('').focus();
                                isError = true;
                                $('.modal__input__client__edit__details').css('border-color', '#f37575');
                            }
                            // возвращаем естесственные цвета
                            $('.modal__input__client__edit__details').unbind('change');
                            $('.modal__input__client__edit__details').bind('change', function () {
                                $('.modal__input__client__edit__details').css('border-color', '#dbdedf');
                            });

                            if (!user.val().trim().length) {
                                user.val('').focus();
                                isError = true;
                                $('.modal__input__user__edit__details').css('border-color', '#f37575');
                            }
                            // возвращаем естесственные цвета
                            $('.modal__input__user__edit__details').unbind('change');
                            $('.modal__input__user__edit__details').bind('change', function () {
                                $('.modal__input__user__edit__details').css('border-color', '#dbdedf');
                            });

                            if (isError) return false;

                            /* ###################################################################### */

                            // обновляем данные в БД
                            $.ajax({
                                url: url_link_t,
                                method: 'post',
                                data: {
                                    'domain': document.domain,
                                    'method': 'edit_history_details',
                                    'history_id': historyID,
                                    'essence_id': AMOCRM.data.current_card.id,
                                    'user': $('.modal__input__user__edit__details').val(),
                                    'client': $('.modal__input__client__edit__details').val(),
                                    'service': $('.modal__input__service__edit__details').val(),
                                    'price': parseInt($('.modal__input__price__edit__details').val()) || 0,
                                    'link_task': $('.modal__input__link__task__edit__details').val(),
                                    'comment': $('.modal__textarea__comment__edit__details').val().trim()
                                },
                                dataType: 'json',
                                success: function (data) {
                                    var timer = data[0];
                                    var deposit = data[1];

                                    // обновляем сумму депозита
                                    if (!rights || !rights.includes('isEditDeposit')) {
                                        $('.history__wrapper__flex .deposit div').text(deposit + 'р.');
                                        $('.modal__input__history__deposit').val(deposit);
                                    } else $('.modal__input__history__deposit').val(deposit);

                                    // обновляем историю
                                    $(`.link__details[data-id="${ timer.id }"] .user__title`).text(timer.user);
                                    $(`.link__details[data-id="${ timer.id }"] .user__price .user__sum`).text(timer.price);

                                    // обновляем детализацию
                                    $('.modal__input__user__edit__details').remove();
                                    $('.modal__input__client__edit__details').remove();
                                    $('.modal__input__service__edit__details').remove();
                                    $('.modal__textarea__comment__edit__details').remove();
                                    $('.modal__input__price__edit__details').remove();
                                    $('.modal__input__link__task__edit__details').remove();

                                    $('.user__details__item').text(timer.user);
                                    $('.client__details__item').text(timer.client);
                                    $('.service__details__item').text(timer.service);
                                    $('.comment__details__item').text(timer.comment);
                                    $('.price__details__item').text(timer.price + 'р.');
                                    $('.link__task__details__item').html(`
                                        <a href="${ timer.link_task }" target="_blank" style="
                                            text-decoration: none; color: #1375ab; word-break: break-all;
                                        ">${ timer.link_task }</a> 
                                    `);

                                    $(`.title__user__details__item`).css('padding-top', '10px');
                                    $(`.title__client__details__item`).css('padding-top', '10px');
                                    $(`.title__service__details__item`).css('padding-top', '10px');
                                    $(`.title__comment__details__item`).css('padding-top', '10px');
                                    $(`.title__price__details__item`).css('padding-top', '10px');
                                    $(`.title__link__task__details__item`).css('padding-top', '10px');

                                    // меняем итоговую сумму внизу истории
                                    var price = 0;
                                    $.each($('.user__price .user__sum'), function () {
                                        price += parseInt($(this).text());
                                    });
                                    $('.result__sum .result__price').text(price);
                                }
                            });

                            $('.modal__editBtn__details').css('display', 'block');
                            $('.modal__saveEditBtn__details').css('display', 'none');
                        });
                    }
                }
            });

            /* ###################################################################### */

            // кнопка Закрыть
            $('.modal__hystory__details').css('position', 'relative');
            var cancelBtn = `
                <a href="#" class="modal__cancelBtn__details" style="
                    text-decoration: none;
                    color: #92989b;
                    font-size: 14px;
                    font-weight: bold;
                    top: 3px;
                    right: 0;
                    position: absolute;
                ">Закрыть</a>
            `;
            $('.modal__hystory__details').append(cancelBtn);
            $('.modal__cancelBtn__details').bind('click', function (e) {
                e.preventDefault();
                $('.hystory__details').remove();
            });
        }

        /* ###################################################################### */

        // итоговая сумма истории
        this.resultSum = function (sum = null) {
            $.ajax({
                url: url_link_t,
                method: 'post',
                data: {
                    'domain': document.domain,
                    'method': 'get_sum',
                    'essence_id': AMOCRM.data.current_card.id
                },
                dataType: 'json',
                success: function (data) {
                    if (!data) data = 0;
                    if ($('.result__sum').length) $('.result__sum').remove();
                    $('.x__bottom').before(`
                        <div class="result__sum" style="display: flex; flex-direction: row; justify-content: flex-end;">
                            Итого: &nbsp<div class="result__price">${ sum ? sum : data }</div>р.
                        </div>`);
                    $('.result__sum').css({
                        'width': '100%',
                        'padding': '20px 20px 10px 0',
                        'text-align': 'right'
                    });
                }
            });
        }

        /* ###################################################################### */

        // история таймеров
        const modalHistory = function (e) {
            e.preventDefault();
            var essenseID = AMOCRM.data.current_card.id,
                userID = AMOCRM.constant('user').id;

            // права доступа
            self.getConfigSettings();
            if (self.config_settings.rights && self.config_settings.rights[userID]) {
                rights = self.config_settings.rights[userID];
            }

            // запуск модалки истории
            new Modal({
                class_name: 'timer__history',
                init: function ($modal_body) {
                    var $this = $(this);
                    $modal_body
                        .trigger('modal:loaded')
                        .html(`
                            <div class="modal__timer__history" style="width: 100%; height: 600px;">
                                <h2 class="modal__body__caption head_2">История таймеров</h2>
                            </div>
                        `)
                        .trigger('modal:centrify')
                        .append('');
                },
                destroy: function () {}
            });
            $('.timer__history .modal-body').css('overflow', 'auto');
            $('.modal__timer__history').css('position', 'relative');

            /* ###################################################################### */

            // сумма депозита
            var inputHistoryDeposit = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                    name: 'modal-input-history-deposit',
                    class_name: 'modal__input__history__deposit',
                    value: 0,
                    placeholder: 'укажите сумму депозита'
                }),
                editHistoryBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                    class_name: 'modal__editBtn__history',
                    text: 'Редактировать историю'
                }),
                historyDepositWrapper = `<div class="modal__history__deposit__wrapper" style="width: 100%; margin-top: 20px;">
                    <div class="history__wrapper__flex" style="display: flex; flex-direction: row;">
                        <div class="deposit" style="width: 80%; display: flex; flex-direction: row;">
                            <span>Сумма депозита:</span>
                            <div>${ inputHistoryDeposit }</div>
                        </div>
                        <div class="filter" style="width: 20%; text-align: right; padding-top: 7px;">
                            <a href="" class="link__filter" style="
                                text-decoration: none; color: #1375ab; word-break: break-all;">Фильтр
                            </a>
                        </div>
                    </div>
                </div>`;

            $('.modal__timer__history').append(historyDepositWrapper);
            $('.modal__input__history__deposit').css({ 'margin-bottom': '10px', 'width': '150px' });
            $('.history__wrapper__flex .deposit span').css('margin-top', '8px');
            $('.history__wrapper__flex .deposit div').css('margin-left', '5px');
            $('.modal__input__history__deposit').attr('type', 'number');

            // получаем сумму депозита
            $.ajax({
                url: url_link_t,
                method: 'post',
                data: {
                    'domain': document.domain,
                    'method': 'get_deposit',
                    'essence_id': essenseID
                },
                dataType: 'json',
                success: function (data) {
                    $('.modal__input__history__deposit').val(data)

                    if (!rights || !rights.includes('isEditDeposit')) {
                        $('.modal__input__history__deposit').css('display', 'none');
                        $('.history__wrapper__flex .deposit div').text(data + 'р.');
                        $('.history__wrapper__flex .deposit div').css({
                            'margin-left': '5px',
                            'margin-top': '8px',
                            'padding-bottom': '15px'
                        });
                    }
                }
            });

            // редактирование депозита
            var deposit = $('.modal__input__history__deposit');
            deposit.bind('input', () => deposit.css('border-color', '#dbdedf'));

            deposit.unbind('change');
            deposit.bind('change', function () {
                $.ajax({
                    url: url_link_t,
                    method: 'post',
                    data: {
                        'domain': document.domain,
                        'method': 'change_deposit',
                        'essence_id': essenseID,
                        'deposit': deposit.val()
                    },
                    dataType: 'json',
                    success: function (data) {
                        // обновляем значение депозита
                        deposit.val(data);

                        // красим поле в зеленый цвет
                        deposit.css({ 'transition-duration': '0s', 'border-color': '#2bd153' });
                        setTimeout(() => {
                            deposit.css({ 'transition-duration': '1s', 'border-color': '#dbdedf' });
                        }, 1000);
                    }
                });
            });

            /* ###################################################################### */

            // фильтр поиска
            $('.link__filter').unbind('click');
            $('.link__filter').bind('click', function (e) {
                e.preventDefault();

                new Modal({
                    class_name: 'timer__filter',
                    init: function ($modal_body) {
                        var $this = $(this);
                        $modal_body
                            .trigger('modal:loaded')
                            .html(`
                            <div class="modal__history__filter" style="width: 100%; height: 175px;">
                                <h2 class="modal__body__caption__filter head_2">Фильтр поиска</h2>
                            </div>
                        `)
                            .trigger('modal:centrify')
                            .append('');
                    },
                    destroy: function () {}
                });

                // даты от - до
                var modalInputFrom = Twig({ ref: '/tmpl/controls/date_field.twig' }).render({
                        class_name: 'modal__filter__input__from',
                        input_class: 'input__modal__filter__input__from',
                        value: '',
                        placeholder: 'введите значение от:'
                    }),
                    modalInputTo = Twig({ ref: '/tmpl/controls/date_field.twig' }).render({
                        class_name: 'modal__filter__input__to',
                        input_class: 'input__modal__filter__input__to',
                        value: '',
                        placeholder: 'введите значение до:'
                    }),
                    linkFilterWrapper = `<div class="modal__filter__input__wrapper" style="width: 100%; margin-top: 20px;">
                        <span style="width: 100%;">Введите дату поиска (от - до):</span><br/>
                        <div class="modal__filter__input__flex" style="
                            display: flex;
                            flex-direction: row;
                            width: 100%;
                            margin-top: 3px;
                        ">
                            <div class="date_from">${ modalInputFrom }</div>
                            <div style="padding: 8px 10px 0; color: #dbdedf;">-</div>
                            <div class="date_to">${ modalInputTo }</div>
                        </div>
                    </div>`;
                $('.modal__history__filter').append(linkFilterWrapper);

                // кнопки Показать, Закрыть
                var showBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                        class_name: 'modal__showBtn__filter',
                        text: 'Показать'
                    }),
                    cancelBtn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
                        class_name: 'modal__cancelBtn__filter',
                        text: 'Закрыть'
                    }),
                    actionBtnWrapper = `<div class="modal__body__actions__filter" style="
                        width: 100%; margin-top: 20px;">
                        ${ showBtn } ${ cancelBtn }
                    </div>`;

                $('.modal__history__filter').append(actionBtnWrapper);
                $('.modal__body__caption__filter').css('margin-top', '20px');

                /* ###################################################################### */

                // показ интервала истории
                $('.modal__showBtn__filter').unbind('click');
                $('.modal__showBtn__filter').bind('click', function () {
                    var filter_from = $('.input__modal__filter__input__from');
                    var filter_to = $('.input__modal__filter__input__to');
                    var isErrorFilter = false;

                    if (!filter_from.val().length) {
                        filter_from.css('border-color', '#f37575');
                        isErrorFilter = true;
                    }

                    if (!filter_to.val().length) {
                        filter_to.css('border-color', '#f37575');
                        isErrorFilter = true;
                    }

                    // возвращаем естесственные цвета
                    filter_from.unbind('click');
                    filter_from.bind('click', function () { filter_from.css('border-color', '#dbdedf') });
                    filter_to.unbind('click');
                    filter_to.bind('click', function () { filter_to.css('border-color', '#dbdedf') });

                    if (isErrorFilter) return false;

                    $.ajax({
                        url: url_link_t,
                        method: 'post',
                        data: {
                            'domain': document.domain,
                            'method': 'filter_history',
                            'essence_id': essenseID,
                            'from': filter_from.val(),
                            'to': filter_to.val(),
                        },
                        dataType: 'json',
                        success: function (data) {
                            // очищаем прежний вывод
                            $.each($('.link__details'), function () { this.remove(); });
                            if ($('.filter__no__result').length) $('.filter__no__result').remove();

                            // добавляем надпись фильтра дат
                            if ($('.filter__timers__title').length) $('.filter__timers__title').remove();
                            $('.modal__history__deposit__wrapper').after(`
                                <div class="filter__timers__title" style="
                                    width: 100%; margin-bottom: 3px; color: #92989b; font-size: 14px;">
                                    Фильтр таймеров с ${ filter_from.val() }г. по ${ filter_to.val() }г.:
                                </div>
                            `);

                            if (!data) {
                                if ($('.history__no__result').length) $('.history__no__result').remove();

                                $('.result__sum').text('Итого: 0р.');
                                $('.filter__timers__title').after(`
                                    <div class="filter__no__result" style="
                                        width: 100%; text-align: center; padding: 30px 0 10px;">
                                        Фильтр не дал результатов.
                                    </div>
                                `);
                                return;
                            }

                            // выводим результат
                            var result_sum = 0;
                            $.each(data, function () {
                                var history_id = this[0],
                                    history_created_at = this[1].split(' ')[0],
                                    history_user = this[2],
                                    history_price = this[3],
                                    history_sum = this[4];

                                var historyItem = `
                                    <div class="link__details" data-id="${history_id}" style="
                                        display: flex;
                                        flex-direction: row;
                                        justify-content: space-between;
                                        width: calc(100% - 10px);
                                        border-top: 1px solid #dbdedf;
                                        border-bottom: 1px solid #dbdedf;
                                        margin-bottom: 2px;
                                        background: #fcfcfc;
                                        padding: 1px 10px;
                                        cursor: pointer;
                                        ">
                                        <div>
                                            <span class="user__created_at" style="color: #979797; font-size: 13px;">
                                                ${ history_created_at }
                                            </span><br/>
                                            <div class="user__title">${ history_user }</div>
                                        </div>
                                        <div class="user__price" style="display: flex; flex-direction: row; align-items: center;">
                                            <div class="user__sum">${ history_price }</div>
                                            <div class="user_valute">р.</div>
                                        </div>
                                    </div>
                                `;

                                $('.x__bottom').before(historyItem);
                                $('.link__details').unbind('click');
                                $('.link__details').bind('click', self.showDetails);
                                result_sum += parseInt(history_sum);
                            });

                            // меняем итоговую сумму внизу истории
                            self.resultSum(result_sum);
                        }
                    });

                    $('.timer__filter').remove();
                });
            });

            /* ###################################################################### */

            // получаем данные
            $.ajax({
                url: url_link_t,
                method: 'post',
                data: {
                    'domain': document.domain,
                    'method': 'hystory',
                    'essence_id': essenseID
                },
                dataType: 'json',
                success: function (data) {
                    if ($('.history__no__result').length) $('.history__no__result').remove();

                    if (!data) {
                        $('.result__sum').text('Итого: 0р.');
                        $('.modal__history__deposit__wrapper').after(`
                            <div class="history__no__result" style="
                                width: 100%; text-align: center; padding: 30px 0 10px;">
                                Таймеров не найдено.
                            </div>
                        `);
                    }

                    // добавляем историю таймеров (дата, ответственный, сумма)
                    $.each(data, function () {
                        var history_id = this[0],
                            history_created_at = this[1].split(' ')[0],
                            history_user = this[2],
                            history_price = this[3];

                        var historyItem = `
                            <div class="link__details" data-id="${ history_id }" style="
                                display: flex;
                                flex-direction: row;
                                justify-content: space-between;
                                width: calc(100% - 10px);
                                border-top: 1px solid #dbdedf;
                                border-bottom: 1px solid #dbdedf;
                                margin-bottom: 2px;
                                background: #fcfcfc;
                                padding: 1px 10px;
                                cursor: pointer;
                                ">
                                <div>
                                    <span class="user__created_at" style="color: #979797; font-size: 13px;">
                                        ${ history_created_at }
                                    </span><br/>
                                    <div class="user__title">${ history_user }</div>
                                </div>
                                <div class="user__price" style="display: flex; flex-direction: row; align-items: center;">
                                    <div class="user__sum">${ history_price }</div>
                                    <div class="user_valute">р.</div>
                                </div>
                            </div>
                        `;

                        $('.modal__timer__history').append(historyItem);
                        $('.link__details').unbind('click');
                        $('.link__details').bind('click', self.showDetails);
                    });

                    // итоговая сумма истории
                    $('.modal__timer__history').append(`<div class="x__bottom"></div>`);
                    self.resultSum();

                    // отступ снизу
                    $('.modal__timer__history').append('<div style="height: 30px;"></div>');
                }
            });

            /* ###################################################################### */

            // кнопка Закрыть
            hystoryCancelBtn = `
                <a href="#" class="hystory__cancel__btn" style="
                    text-decoration: none;
                    color: #92989b;
                    font-size: 14px;
                    font-weight: bold;
                    top: 3px;
                    right: 0;
                    position: absolute;
                ">Закрыть</a>
            `;

            $('.modal__timer__history').append(hystoryCancelBtn);
            $('.hystory__cancel__btn').bind('click', function (e) {
                e.preventDefault();
                $('.timer__history').remove();
            });
        }

        /* ###################################################################### */

        // модалка таймера
        const modalTimer = function () {
            $('.billing__link').bind('click', function (e) {
                e.preventDefault();
                self.clearIntervals();

                var interval,
                    services = [],
                    rights = false,
                    priceManager = 0,
                    userID = AMOCRM.constant('user').id,
                    essenseID = AMOCRM.data.current_card.id,
                    timezone = AMOCRM.constant('account').timezone;

                // права доступа и стоимость сотрудника из настроек
                self.getConfigSettings();
                if (self.config_settings.rights && self.config_settings.rights[userID]) {
                    rights = self.config_settings.rights[userID];
                }

                /* ###################################################################### */

                // запуск модалки
                new Modal({
                    class_name: 'timer',
                    init: function ($modal_body) {
                        var $this = $(this);
                        $modal_body
                            .trigger('modal:loaded')
                            .html(`
                                <div class="modal__timer" style="width: 100%; min-height: 240px;">
                                    <h2 class="modal__body__caption head_2">Таймер</h2>
                                </div>
                            `)
                            .trigger('modal:centrify')
                            .append('');
                    },
                    destroy: function () {}
                });

                /* ###################################################################### */

                // проверка авторизации для запуска таймера
                $.ajax({
                    url: url_link_t,
                    method: 'post',
                    data: { 'domain': document.domain, 'method': 'isAuth' },
                    dataType: 'html',
                    success: function(data) {
                        if (!data) {
                            $('.hystory__link').css('display', 'none');
                            $('.modal__link__project__wrapper').css('display', 'none');
                            $('.modal__link__task__wrapper').css('display', 'none');
                            $('.modal__timer__wrapper').css('display', 'none');
                            $('.modal__body__caption').after(`
                                <div class="noIsAuth" style="
                                    display: flex; align-items: center; justify-content: center; height: 150px;">
                                    Виджет не авторизован<br/>
                                </div>
                            `);
                        }
                    }
                });

                /* ###################################################################### */

                // история
                $('.modal__timer').css('position', 'relative');
                hystoryLink = `
                    <a href="#" class="hystory__link" style="
                        text-decoration: none; color: #1375ab; top: 5px; right: 0; position: absolute;
                    ">История</a>
                `;

                if (rights && rights.includes('isShowHistory')) {
                    $('.modal__timer').append(hystoryLink);
                    $('.hystory__link').unbind('click');
                    $('.hystory__link').bind('click', modalHistory);
                }

                /* ###################################################################### */

                // ссылка на проект
                var linkProjectWrapper = `<div class="modal__link__project__wrapper" style="
                        width: 100%; margin-top: 20px;
                    ">
                    <span style="width: 100%;">Ссылка на проект:</span><br/>
                    <a href="#" class="modal__link__project" style="
                        margin-top: 3px; text-decoration: none; color: #1375ab; word-break: break-all;" target="_blank">
                    </a>
                </div>`;

                var changeLinkProject = `<a href="#" class="change__link__project" style="
                    text-decoration: none; color: #6b6d72;">&nbsp;(изменить)
                </a>`;

                $('.modal__timer').append(linkProjectWrapper);
                $('.modal__link__project').attr('href', $('.modal__link__project').text());
                if (rights && rights.includes('isEditLink')) $('.modal__link__project').after(changeLinkProject);

                // поле ввода изменения ссылки на проект
                var inputLinkProject = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                    name: 'modal-input-link-project',
                    class_name: 'modal__input__link__project',
                    value: '',
                    placeholder: 'вставьте ссылку на проект'
                });

                // редактирование ссылки на проект
                const changeLink = function (e) {
                    e.preventDefault();

                    // меняем ссылку на поле ввода
                    $('.modal__link__project__wrapper').append(inputLinkProject);
                    $('.modal__input__link__project').css({ 'width': '100%', 'margin-top': '3px' }).focus();
                    $('.modal__input__link__project').val($('.modal__link__project').text().trim());
                    $('.modal__link__project').remove();
                    $('.change__link__project').remove();

                    // меняем текст ссылки, удаляем поле ввода и возвращаем ссылку
                    $('.modal__input__link__project').focusout(function (e) {
                        e.preventDefault();

                        // обновляем ссылку в БД
                        $.ajax({
                            url: url_link_t,
                            method: 'post',
                            data: {
                                'domain': document.domain,
                                'method': 'change_link_project',
                                'essence_id': essenseID,
                                'link_project': $('.modal__input__link__project').val().trim()
                            },
                            dataType: 'json',
                            success: function (data) {
                                $('.modal__link__project__wrapper').append(`
                                    <a href="#" class="modal__link__project" style="
                                        margin-top: 3px; text-decoration: none; color: #1375ab; word-break: break-all;" target="_blank">
                                    </a>
                                `);
                                $('.modal__link__project').text(data);
                                $('.modal__link__project').attr('href', data);
                                $('.modal__link__project').after(changeLinkProject);
                                $('.modal__input__link__project').remove();
                                $('.change__link__project').bind('click', changeLink);
                            }
                        });
                    });
                }

                $('.change__link__project').unbind('click');
                $('.change__link__project').bind('click', changeLink);

                // показываем актуальную ссылку на проект
                $.ajax({
                    url: url_link_t,
                    method: 'post',
                    data: {
                        'domain': document.domain,
                        'method': 'link_project',
                        'essence_id': essenseID
                    },
                    dataType: 'json',
                    success: function (data) {
                        $('.modal__link__project').text(data);
                        $('.modal__link__project').attr('href', data);
                    }
                });

                /* ###################################################################### */

                // ссылка на задачу
                var inputLinkTask = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                    name: 'modal-input-link-task',
                    class_name: 'modal__input__link__task',
                    value: '',
                    placeholder: 'вставьте ссылку на задачу'
                });

                var linkTaskWrapper = `<div class="modal__link__task__wrapper" style="width: 100%; margin-top: 10px;">
                    <span style="width: 100%;">Ссылка на задачу:</span><br/>
                    ${ inputLinkTask }
                </div>`;

                $('.modal__timer').append(linkTaskWrapper);
                $('.modal__input__link__task').css({ 'width': '100%', 'margin-top': '3px' });

                // возвращаем актуальный цвет рамки в случае ошибки
                $('.modal__input__link__task').unbind('input');
                $('.modal__input__link__task').bind('input', () => {
                    $('.modal__input__link__task').css('border-color', '#dbdedf');
                });

                // показываем актуальную ссылку на задачу, если таймер был ранее запущен
                $.ajax({
                    url: url_link_t,
                    method: 'post',
                    data: {
                        'domain': document.domain,
                        'method': 'link_task',
                        'essence_id': essenseID,
                        'user_id': userID
                    },
                    dataType: 'json',
                    success: function (data) {
                        if (!data) $('.modal__input__link__task').val('');
                        else {
                            $('.modal__input__link__task').val(data);
                            $('.modal__input__link__task').css('display', 'none');
                            $('.modal__link__task__wrapper').append(`<a href="${ data }" class="modal__link__task" style="
                                    margin-top: 3px; text-decoration: none; color: #1375ab; word-break: break-all;" target="_blank">
                                    ${ data }
                                </a>
                            `);
                        }
                    }
                });

                /* ###################################################################### */

                // таймер
                var startTimerBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                        class_name: 'start__timer__btn',
                        text: 'Старт',
                    }),
                    pauseTimerBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                        class_name: 'pause__timer__btn',
                        text: 'Пауза',
                    }),
                    stopTimerBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                        class_name: 'stop__timer__btn',
                        text: 'Стоп',
                    });

                var timerWrapper = `<div class="modal__timer__wrapper" style="
                        width: 100%; margin-top: 20px; display: flex; flex-direction: row;
                    ">
                    <span style="font-size: 24px; margin-right: 20px;" class="time__timer">00:00:00</span>
                    <div class="btns__timer" style="display: flex; flex-direction: row;">
                        ${ startTimerBtn } ${ pauseTimerBtn } ${ stopTimerBtn }
                    </div>
                </div>`;

                $('.modal__timer').append(timerWrapper);
                $('.start__timer__btn').css({ 'margin-left': '5px', 'margin-top': '-2px', 'width': '100px', 'display': 'none' });
                $('.pause__timer__btn').css({ 'margin-left': '5px', 'margin-top': '-2px', 'width': '100px', 'display': 'none' });
                $('.stop__timer__btn').css({ 'margin-left': '5px', 'margin-top': '-2px', 'width': '100px', 'display': 'none' });

                // отображение таймера
                $.ajax({
                    url: url_link_t,
                    method: 'post',
                    data: {
                        'domain': document.domain,
                        'method': 'timer',
                        'essence_id': essenseID,
                        'user_id': userID,
                        'timezone': timezone
                    },
                    dataType: 'json',
                    success: function (data) {
                        self.clearIntervals();

                        // если запись не найдена, отображаем старт времени
                        if (!data) {
                            $('.modal__timer__wrapper .time__timer').text('00:00:00');
                            $('.start__timer__btn').css('display', 'block');
                            $('.pause__timer__btn').css('display', 'none');
                            $('.stop__timer__btn').css('display', 'none');
                        }
                        else {
                            var time_work = data['time_work'];
                            var status = data['status'];

                            // иначе получаем время таймера
                            var date = new Date();
                            var time = time_work.split(' ');
                            time = time[1].split(':');
                            date.setHours(time[0]);
                            date.setMinutes(time[1]);
                            date.setSeconds(time[2]);
                            $('.modal__timer__wrapper .time__timer').text(date.toLocaleTimeString());

                            if (status === 'pause') {
                                $('.start__timer__btn').css('display', 'block');
                                $('.pause__timer__btn').css('display', 'none');
                                $('.stop__timer__btn').css('display', 'block');
                            }

                            if (status === 'stop') {
                                $('.start__timer__btn').css('display', 'none');
                                $('.pause__timer__btn').css('display', 'none');
                                $('.stop__timer__btn').css('display', 'block');
                                $('.stop__timer__btn').text('Сохранить');
                            }

                            // если таймер запущен, запускаем интервал
                            if (status === 'start') {
                                $('.start__timer__btn').css('display', 'none');
                                $('.pause__timer__btn').css('display', 'block');
                                $('.stop__timer__btn').css('display', 'block');

                                interval = setInterval(() => {
                                    // если время максимальное, останавливаем таймер
                                    if (date.getHours() === 23 && date.getMinutes() === 59 && date.getSeconds() === 59) {
                                        clearInterval(interval);
                                        // показываем кнопку сохранить
                                        $('.start__timer__btn').css('display', 'none');
                                        $('.pause__timer__btn').css('display', 'none');
                                        $('.stop__timer__btn').css('display', 'block');
                                        $('.stop__timer__btn').text('Сохранить');

                                        // обновляем время на сервере на максимальное
                                        $.ajax({
                                            url: url_link_t,
                                            method: 'post',
                                            data: {
                                                'domain': document.domain,
                                                'method': 'stop_auto_stop',
                                                'essence_id': essenseID,
                                                'user_id': userID,
                                            },
                                            dataType: 'json',
                                            success: function (data) {}
                                        });

                                        return false;
                                    }

                                    // +1 сек к времени в интервале
                                    date.setSeconds(date.getSeconds() + 1);
                                    $('.modal__timer__wrapper .time__timer').text(date.toLocaleTimeString());
                                }, 1000);
                            }
                        }
                    }
                });

                // timer start
                $('.start__timer__btn').unbind('click');
                $('.start__timer__btn').bind('click', function () {
                    self.clearIntervals();

                    // если ссылки на задачу нет, отключаем кнопку
                    if ($('.modal__input__link__task').val().trim().length === 0) {
                        $('.modal__input__link__task').css('border-color', '#f37575');
                        $('.modal__input__link__task').val('').focus();
                        return false;
                    }

                    $.ajax({
                        url: url_link_t,
                        method: 'post',
                        data: {
                            'domain': document.domain,
                            'method': 'timer_start',
                            'essence_id': essenseID,
                            'user_id': userID,
                            'link_task': $('.modal__input__link__task').val().trim(),
                            'timezone': timezone
                        },
                        dataType: 'json',
                        success: function (data) {
                            // показываем кнопки паузы и стоп
                            $('.start__timer__btn').css('display', 'none');
                            $('.pause__timer__btn').css('display', 'block');
                            $('.stop__timer__btn').css('display', 'block');

                            // обновляем ссылку на задачу
                            $('.modal__input__link__task').val(data.link_task);
                            $('.modal__input__link__task').css('display', 'none');
                            if (!$('.modal__link__task').length) {
                                $('.modal__link__task__wrapper').append(`<a href="${ data.link_task }" class="modal__link__task" style="
                                        margin-top: 3px; text-decoration: none; color: #1375ab; word-break: break-all;" target="_blank">
                                        ${ data.link_task }
                                    </a>
                                `);
                            }

                            // получаем время таймера
                            var date = new Date();
                            var time = data.time_work.split(' ');
                            time = time[1].split(':');
                            date.setHours(time[0]);
                            date.setMinutes(time[1]);
                            date.setSeconds(time[2]);

                            // запускаем интервал
                            interval = setInterval(() => {
                                // если время максимальное, останавливаем таймер
                                if (date.getHours() === 23 && date.getMinutes() === 59 && date.getSeconds() === 59) {
                                    clearInterval(interval);
                                    // показываем кнопку сохранить
                                    $('.start__timer__btn').css('display', 'none');
                                    $('.pause__timer__btn').css('display', 'none');
                                    $('.stop__timer__btn').css('display', 'block');
                                    $('.stop__timer__btn').text('Сохранить');

                                    // обновляем время на сервере на максимальное
                                    $.ajax({
                                        url: url_link_t,
                                        method: 'post',
                                        data: {
                                            'domain': document.domain,
                                            'method': 'stop_auto_stop',
                                            'essence_id': essenseID,
                                            'user_id': userID,
                                        },
                                        dataType: 'json',
                                        success: function (data) {}
                                    });

                                    return false;
                                }

                                // +1 сек к времени в интервале
                                date.setSeconds(date.getSeconds() + 1);
                                $('.modal__timer__wrapper .time__timer').text(date.toLocaleTimeString());
                            }, 1000);
                        }
                    });
                });

                // timer pause
                $('.pause__timer__btn').unbind('click');
                $('.pause__timer__btn').bind('click', function () {
                    self.clearIntervals();

                    // показываем кнопки старт и стоп
                    $('.start__timer__btn').css('display', 'block');
                    $('.pause__timer__btn').css('display', 'none');
                    $('.stop__timer__btn').css('display', 'block');

                    // обновляем значение таймера на сервере
                    $.ajax({
                        url: url_link_t,
                        method: 'post',
                        data: {
                            'domain': document.domain,
                            'method': 'timer_pause',
                            'essence_id': essenseID,
                            'user_id': userID
                        },
                        dataType: 'json',
                        success: function (data) {}
                    });
                });

                // timer stop
                $('.stop__timer__btn').unbind('click');
                $('.stop__timer__btn').bind('click', function () {
                    self.clearIntervals();

                    // показываем кнопку сохранить
                    $('.start__timer__btn').css('display', 'none');
                    $('.pause__timer__btn').css('display', 'none');
                    $('.stop__timer__btn').css('display', 'block');
                    $('.stop__timer__btn').text('Сохранить');

                    // обновляем значение таймера на сервере
                    $.ajax({
                        url: url_link_t,
                        method: 'post',
                        data: {
                            'domain': document.domain,
                            'method': 'timer_stop',
                            'essence_id': essenseID,
                            'user_id': userID
                        },
                        dataType: 'json',
                        success: function (data) {}
                    });

                    /* ###################################################################### */

                    // запуск модалки завершения
                    new Modal({
                        class_name: 'timer__stop',
                        init: function ($modal_body) {
                            var $this = $(this);
                            $modal_body
                                .trigger('modal:loaded')
                                .html(`
                                    <div class="modal__timer__stop" style="width: 100%; min-height: 385px;">
                                        <h2 class="modal__body__caption head_2">Сохранение таймера</h2>
                                    </div>
                                `)
                                .trigger('modal:centrify')
                                .append('');
                        },
                        destroy: function () {}
                    });

                    /* ###################################################################### */

                    // выбор ответственного
                    var managers = [];
                    managers.push({ id: 'null', option: 'Выберите ответственного' });

                    $.each(AMOCRM.constant('managers'), function () {
                        if (!this.active) return;
                        managers.push({ id: this.id, option: this.title });
                    });

                    var selectManagers = Twig({ ref: '/tmpl/controls/select.twig' }).render({
                            items: managers,
                            class_name: 'modal__select__managers'
                        }),
                        selectManagersWrapper = `<div class="modal__select__managers__wrapper" style="width: 100%; margin-top: 20px;">
                            <span style="width: 100%;">Выбор ответственного:</span><br/>
                            ${ selectManagers }
                        </div>`;

                    $('.modal__timer__stop').append(selectManagersWrapper);
                    $('.modal__select__managers').css('margin-top', '3px');
                    $('.modal__select__managers .control--select--button').css('width', '100%');
                    $('.modal__select__managers ul').css({
                        'margin-left': '13px',
                        'width': 'auto',
                        'min-width': $('.modal__timer__stop').outerWidth() - 13
                    });

                    /* ###################################################################### */

                    // имя клиента
                    var inputClientName = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                        name: 'modal-input-client-name',
                        class_name: 'modal__input__client__name',
                        value: '',
                        placeholder: 'введите имя клиента'
                    });

                    var inputClientNameWrapper = `<div class="modal__client__name__wrapper" style="width: 100%; margin-top: 10px;">
                        <span style="width: 100%;">Имя клиента:</span><br/>
                        ${ inputClientName }
                    </div>`;

                    $('.modal__timer__stop').append(inputClientNameWrapper);
                    $('.modal__input__client__name').css({ 'width': '100%', 'margin-top': '3px' });

                    /* ###################################################################### */

                    // выбор услуги
                    services = [];
                    services.push({ id: 'null', option: 'Выберите оказанную услугу' });
                    $.ajax({
                        url: url_link_t,
                        method: 'post',
                        data: {
                            'domain': document.domain,
                            'method': 'show_services'
                        },
                        dataType: 'json',
                        success: function (data) {
                            $.each(data, function () { services.push({ id: this[0], option: this[1] }) });

                            var selectServices = Twig({ ref: '/tmpl/controls/select.twig' }).render({
                                    items: services,
                                    class_name: 'modal__select__services'
                                }),
                                editBtnServices = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                                    class_name: 'editBtn__services',
                                    text: 'Редактировать'
                                }),
                                selectServicesWrapper = `<div class="modal__select__services__wrapper" style="width: 100%; margin-top: 10px;">
                                    <span style="width: 100%;">Список оказанных услуг:</span><br/>
                                    <div class="select__wrapper__flex" style="display: flex; flex-direction: row;">
                                        <div class="select" style="width: 70%;"></div>
                                        <div class="buttonEdit" style="width: 30%; text-align: right;"></div>
                                    </div>
                                </div>`;

                            $('.modal__client__name__wrapper').after(selectServicesWrapper);
                            $('.modal__select__services__wrapper .select').append(selectServices);
                            $('.modal__select__services__wrapper .buttonEdit').append(editBtnServices);
                            $('.modal__select__services').css('margin-top', '3px');
                            $('.editBtn__services').css('margin-top', '3px');
                            $('.modal__select__services .control--select--button').css('width', '100%');
                            $('.modal__select__services ul').css({
                                'margin-left': '13px',
                                'width': 'auto',
                                'min-width': $('.modal__timer__stop').outerWidth() - 13
                            });

                            // проверяем права на редактирование
                            if (!rights || !rights.includes('isEditServices')) {
                                $('.select__wrapper__flex .select').css('width', '100%');
                                $('.select__wrapper__flex .buttonEdit').remove();
                            }

                            /* ###################################################################### */

                            // редактирование списка услуг
                            $('.editBtn__services').unbind('click');
                            $('.editBtn__services').bind('click', function () {
                                // запуск модалки редактирования
                                new Modal({
                                    class_name: 'timer__edit__services',
                                    init: function ($modal_body) {
                                        var $this = $(this);
                                        $modal_body
                                            .trigger('modal:loaded')
                                            .html(`
                                                <div class="modal__timer__edit__services" style="width: 100%; min-height: 450px;">
                                                    <h2 class="modal__body__caption head_2" style="margin-bottom: 10px;">Редактирование оказанных услуг</h2>
                                                </div>
                                            `)
                                            .trigger('modal:centrify')
                                            .append('');
                                    },
                                    destroy: function () {}
                                });

                                // ссылка добавления варианта
                                linkAddService = `
                                    <a href="" class="modal__link__add__service" style="
                                        text-decoration: block;
                                        color: #1375ab;
                                        margin-top: 10px;
                                    ">Добавить</a>
                                `;
                                $('.modal__timer__edit__services').append(linkAddService);

                                // функция добавления варианта
                                const addInput = function (id = '', option = '') {
                                    var input = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                                        name: 'modal-input-edit-service',
                                        class_name: 'modal_input__edit__service',
                                        value: option,
                                        placeholder: 'Вариант',
                                        max_length: 50
                                    });

                                    // вставляем и ровняем инпут и кнопку удаления
                                    $('.modal__link__add__service').before(`
                                        <div class="select__enums__item" style="
                                            margin-bottom: 4px;
                                            width: 100%;
                                            position: relative;
                                        ">
                                            <div class="cf-field-enum__remove" title="Удалить" style="width: auto;">
                                                <svg class="svg-icon svg-common--trash-dims"><use xlink:href="#common--trash"></use></svg>
                                            </div>
                                            ${ input }
                                        </div>
                                    `);

                                    $('.modal_input__edit__service').css({ 'padding-right': '25px', 'width': '100%' });
                                    $('.modal_input__edit__service').attr('data-id', id);
                                    $('.cf-field-enum__remove').css({
                                        'position': 'absolute',
                                        'top': '10px',
                                        'left': $('.modal_input__edit__service').outerWidth() - 20,
                                        'cursor': 'pointer'
                                    });

                                    // удаление инпута
                                    $('.cf-field-enum__remove').unbind('click');
                                    $('.cf-field-enum__remove').bind('click', function (e) {
                                        $(e.target).closest('.select__enums__item').remove();
                                    });
                                }

                                // выводим ранее сохраненные варианты
                                if (services.length > 1) {
                                    $.each(services, function () {
                                        if (this.option === 'Выберите оказанную услугу') return;
                                        addInput(this.id, this.option);
                                    });
                                } else addInput();

                                // добавление варианта
                                $('.modal__link__add__service').unbind('click');
                                $('.modal__link__add__service').bind('click', function (e) {
                                    e.preventDefault();
                                    if (!$('.modal_input__edit__service').length) addInput();
                                    else {
                                        var isEmptyInput = false;
                                        $.each($('.modal_input__edit__service'), function () {
                                            if (!$(this).val().trim().length) {
                                                $(this).val('').focus();
                                                isEmptyInput = true;
                                                return false;
                                            }
                                        });
                                        if (!isEmptyInput) addInput();
                                    }
                                });

                                /* ###################################################################### */

                                // кнопки Сохранить и Закрыть
                                var saveServicesBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                                        class_name: 'modal__saveBtn__services',
                                        text: 'Сохранить'
                                    }),
                                    cancelServicesBtn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
                                        class_name: 'modal__cancelBtn__services',
                                        text: 'Закрыть'
                                    }),
                                    btnWrapper = `<div class="modal__body__actions__services" style="width: 100%;">
                                        ${ saveServicesBtn } ${ cancelServicesBtn }
                                    </div>`;

                                $('.modal__timer__edit__services').append(btnWrapper);
                                $('.modal__body__actions__services').css('margin-top', '20px');

                                $('.modal__saveBtn__services').unbind('click');
                                $('.modal__saveBtn__services').bind('click', function () {
                                    $('.modal__select__services').remove();
                                    $('.modal__select__services__wrapper').css('display', 'none');

                                    // обновляем массив списка услуг
                                    services = [];
                                    $.each($('.modal_input__edit__service'), function () {
                                        if (!$(this).val().trim().length) return;
                                        services.push($(this).val().trim());
                                    });

                                    // обновляем список услуг в БД
                                    $.ajax({
                                        url: url_link_t,
                                        method: 'post',
                                        data: {
                                            'domain': document.domain,
                                            'method': 'edit_services',
                                            'services': services
                                        },
                                        dataType: 'json',
                                        success: function (data) {
                                            services = [];
                                            services.push({ id: 'null', option: 'Выберите оказанную услугу' });
                                            $.each(data, function () { services.push({ id: this[0], option: this[1] }) });

                                            var selectServices = Twig({ ref: '/tmpl/controls/select.twig' }).render({
                                                items: services,
                                                class_name: 'modal__select__services'
                                            });

                                            $('.modal__select__services__wrapper .select').append(selectServices);
                                            $('.modal__select__services__wrapper').css('display', 'block');
                                            $('.modal__select__services').css('margin-top', '3px');
                                            $('.modal__select__services .control--select--button').css('width', '100%');
                                            $('.modal__select__services ul').css({
                                                'margin-left': '13px',
                                                'width': 'auto',
                                                'min-width': $('.modal__timer__stop').outerWidth() - 13
                                            });
                                        }
                                    });

                                    $('.timer__edit__services').remove();
                                });

                                // margin-bottom для отступа
                                $('.modal__body__actions__services').append(`
                                    <div class="modal__bottom" style="position: absolute; height: 100px; width: 100%;"></div>
                                `);
                            });
                        }
                    });

                    /* ###################################################################### */

                    // комментарий
                    var textareaComment = Twig({ ref: '/tmpl/controls/textarea.twig' }).render({
                            name: 'modal-textarea-comment',
                            class_name: 'modal__textarea__comment',
                            placeholder: 'введите комментарий'
                        }),
                        textareaCommentWrapper = `<div class="modal__textarea__comment__wrapper" style="width: 100%; margin-top: 10px;">
                            <span style="width: 100%;">Комментарий:</span><br/>
                            ${ textareaComment }
                        </div>`;

                    $('.modal__timer__stop').append(textareaCommentWrapper);
                    $('.modal__textarea__comment').css({ 'width': '100%', 'margin-top': '3px' });

                    /* ###################################################################### */

                    // кнопки Сохранить и Закрыть
                    var saveBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                            class_name: 'modal__saveBtn__timer',
                            text: 'Сохранить'
                        }),
                        cancelBtn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
                            class_name: 'modal__cancelBtn__timer',
                            text: 'Закрыть'
                        }),
                        btnWrapper = `<div class="modal__body__actions__stop" style="width: 100%;">
                            ${ saveBtn } ${ cancelBtn }
                        </div>`;

                    $('.modal__timer__stop').append(btnWrapper);
                    $('.modal__body__actions__stop').css('margin-top', '20px');

                    // margin-bottom для отступа
                    $('.modal__timer__stop').append(`
                        <div class="modal__bottom" style="position: absolute; height: 70px; width: 100%;"></div>
                    `);

                    /* ###################################################################### */

                    // сохранение таймера в БД
                    $('.modal__saveBtn__timer').unbind('click');
                    $('.modal__saveBtn__timer').bind('click', function () {
                        // если необходимые поля не выбраны, красим в красный
                        var manager = $('.modal__select__managers .control--select--button');
                        var managerID = $('.modal__select__managers .control--select--button').attr('data-value');
                        var client = $('.modal__input__client__name');
                        var service = $('.modal__select__services .control--select--button');
                        var comment = $('.modal__textarea__comment');
                        var error = false;

                        if (manager.text() === 'Выберите ответственного') {
                            manager.css('border-color', '#f57d7d');
                            error = true;
                        }

                        if (!client.val().trim().length) {
                            client.css('border-color', '#f57d7d');
                            client.val(client.val().trim());
                            error = true;
                        }

                        if (service.text() === 'Выберите оказанную услугу') {
                            service.css('border-color', '#f57d7d');
                            error = true;
                        }

                        // возвращаем естесственные цвета в случае изменения
                        manager.unbind('click');
                        manager.bind('click', function () { manager.css('border-color', '#d4d5d8') });
                        client.unbind('change');
                        client.bind('change', function () { client.css('border-color', '#d4d5d8') });
                        service.unbind('click');
                        service.bind('click', function () { service.css('border-color', '#d4d5d8') });

                        if (error) return false;

                        /* ###################################################################### */

                        // стоимость выбранного сотрудника
                        if (self.config_settings.priceManager && self.config_settings.priceManager[managerID]) {
                            priceManager = self.config_settings.priceManager[managerID];
                        }

                        // сохраняем результат в БД
                        $.ajax({
                            url: url_link_t,
                            method: 'post',
                            data: {
                                'domain': document.domain,
                                'method': 'timer_save',
                                'essence_id': essenseID,
                                'user_id': userID,
                                'priceManager': priceManager,
                                'user': manager.text(),
                                'client': client.val().trim(),
                                'service': service.text(),
                                'comment': $('.modal__textarea__comment').val().trim()
                            },
                            dataType: 'json',
                            success: function (data) {}
                        });

                        // возвращаем значения по умолчанию для старта таймера
                        $('.timer__stop').remove();
                        $('.modal__link__task').remove();
                        $('.modal__input__link__task').css('display', 'block');
                        $('.modal__input__link__task').val('');
                        $(`.modal__timer__wrapper .time__timer`).text('00:00:00');
                        $('.start__timer__btn').css('display', 'block');
                        $('.pause__timer__btn').css('display', 'none');
                        $('.stop__timer__btn').css('display', 'none');
                        $('.stop__timer__btn').text('Стоп');
                    });
                });

                // кнопка Закрыть
                var cancelBtn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
                        class_name: 'modal__cancelBtn__timer',
                        text: 'Закрыть'
                    }),
                    cancelBtnWrapper = `<div class="modal__body__actions" style="width: 100%;">
                        ${ cancelBtn }
                    </div>`;

                $('.modal__timer').append(cancelBtnWrapper);
                $('.modal__body__actions').css('margin-top', '20px');

                // margin-bottom для отступа
                $('.modal__timer').append('<div class="modal__bottom" style="position: absolute; height: 70px; width: 100%;"></div>');
            });
        }

        /* ###################################################################### */

        // настройка прав доступа
        this.accessRight = function () {
            self.getConfigSettings();

            // список активных пользователей
            var managers = [], checkbox;
            managers.push({ option: 'Выберите пользователя' });
            $.each(AMOCRM.constant('managers'), function () {
                if (!this.active) return;
                managers.push({ id: this.id, option: this.title });
            });

            // селект с пользователями
            var selectManagers = Twig({ ref: '/tmpl/controls/select.twig' }).render({
                items: managers,
                class_name: 'select__managers'
            });
            var selectManagersWrapper = `
                <div class="widget_settings_block__item_field select__managers__wrapper" style="margin-top: 10px;">
                    <div class="widget_settings_block__title_field" title="" style="margin-bottom: 3px;">
                        Настройка прав пользователей:
                    </div>
                    <div class="widget_settings_block__input_field" style="width: 100%;">
                        ${ selectManagers }
                    </div>
                </div> 
            `;

            $('.widget_settings_block__controls').before(selectManagersWrapper);
            $('.select__managers__wrapper .control--select--button').css('width', '100%');
            $('.select__managers__wrapper ul').css({
                'margin-left': '13px',
                'width': '100%',
                'min-width': $('.select__managers__wrapper').outerWidth() - 13
            });

            // выбор пользователя
            $('.select__managers__wrapper ul li').unbind('click');
            $('.select__managers__wrapper ul li').bind('click', function () {
                var managerID = $(this).attr('data-value');

                // очищаем перед запуском чекбоксы
                $('.modal__rights__checkox__wrapper').remove();
                $('.input__price__wrapper').remove();
                if ($(this).find('span').text() === 'Выберите пользователя') {
                    $('.modal__rights__checkox__wrapper').remove();
                    $('.input__price__wrapper').remove();
                    return;
                }

                // стоимость сотрудника
                var inputPrice = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                    name: 'input-price',
                    class_name: 'input__price',
                    value: '0',
                    placeholder: 'введите стоимость сотрудника',
                    max_length: 50
                });

                // вставляем и ровняем инпут type=number
                $('.widget_settings_block__controls').before(`
                    <div class="widget_settings_block__item_field input__price__wrapper" style="margin-top: 10px; width: 100%;">
                        <div class="widget_settings_block__title_field" title="">
                            Стоимость сотрудника в минуту (р.):
                        </div>
                    <div class="widget_settings_block__input_field" style="width: 100%;">${ inputPrice }</div>
                    </div>
                `);
                $('.input__price').attr('type', 'number');
                $('.input__price').css('width', '100%');

                $('.input__price').unbind('change');
                $('.input__price').bind('change', function () {
                    var priceManager = parseInt($(this).val()) || 0;

                    if (!self.config_settings.priceManager) self.config_settings.priceManager = {};
                    self.config_settings.priceManager[managerID] = priceManager;
                    self.saveConfigSettings();
                    $(this).val(priceManager);
                });

                // ддобавление чекбокса
                const addCheckbox = function (value, dataValue) {
                    checkbox = Twig({ ref: '/tmpl/controls/checkbox.twig' }).render({
                        class_name: 'modal__rights__checkox',
                        checked: false,
                        value: value,
                        input_class_name: 'modal__rights__checkox__item',
                        name: 'modal-rights--checkox',
                        text: value,
                        dataValue: dataValue
                    });

                    return checkbox;
                }

                checkboxWrapper = '<div class="modal__rights__checkox__wrapper" style="width: 100%; margin-top: 10px;"></div>';
                $('.widget_settings_block__controls').before(checkboxWrapper);

                // ссылка в сущности
                var isEditLink = addCheckbox('Редактирование ссылки в сущности', 'isEditLink');
                $('.modal__rights__checkox__wrapper').append(isEditLink);
                // список в форме на выбор услуги
                var isEditServices = addCheckbox('Редактирование списка в форме на выбор услуги', 'isEditServices');
                $('.modal__rights__checkox__wrapper').append(isEditServices);
                // смотреть историю выполненных задач в сущности
                var isShowHistory = addCheckbox('Просмотр истории выполненных задач в сущности', 'isShowHistory');
                $('.modal__rights__checkox__wrapper').append(isShowHistory);
                // редактирование истории
                var isEditHistory = addCheckbox('Редактирование истории', 'isEditHistory');
                $('.modal__rights__checkox__wrapper').append(isEditHistory);
                // редактирование депозита
                var isEditDeposit = addCheckbox('Редактирование депозита', 'isEditDeposit');
                $('.modal__rights__checkox__wrapper').append(isEditDeposit);
                // выравниваем чекбоксы
                $('.modal__rights__checkox').css({ 'width': '100%', 'margin-top': '3px' });

                // если ранее были отмечены, отображаем
                if (self.config_settings.rights) {
                    $.each(self.config_settings.rights, function (key, value) {
                        if (key !== managerID) return;
                        var rights = self.config_settings.rights[managerID];

                        $.each($('.modal__rights__checkox'), function () {
                            var value = $(this).find('.modal__rights__checkox__item').attr('data-value');
                            if (rights.includes(value)) {
                                $(this).addClass('is-checked');
                                $(this).trigger('click');
                            }
                        });
                    });
                }

                if (self.config_settings.priceManager) {
                    $.each(self.config_settings.priceManager, function (key, value) {
                        if (key !== managerID) return;
                        $('.input__price').val(value);
                    });
                }

                // обновляем права пользователя
                $('.modal__rights__checkox').unbind('change');
                $('.modal__rights__checkox').bind('change', function () {
                    // если ранее не был отмечен, создаем
                    if (!self.config_settings.rights) self.config_settings.rights = {};
                    var rights = [];

                    // обновляем список выбранных вариантов
                    $.each($('.modal__rights__checkox'), function () {
                        var value = $(this).find('.modal__rights__checkox__item').attr('data-value');
                        if ($(this).hasClass('is-checked')) rights.push(value);
                    });

                    self.config_settings.rights[managerID] = rights;
                    self.saveConfigSettings();
                });
            });
        }

        /* ###################################################################### */

        // функция показа настроек в разделе Настройки
        this.advancedSettings = function () {
            let search = self.render(
                {ref: '/tmpl/common/search_block.twig'},
                {
                    loader_class_name: 'loader_class_name',
                    search_placeholder: 'Фильтр',
                    id: 'id'
                }
            );

            $(`#work_area #work-area-${ self.get_settings().widget_code }`).append(`
                <div class="safety_settings__section_new tasks_search">
                    <div class="safety_settings__section_head_new">
                        <div class="safety_settings__section_head_new_title">
                            Задачи
                        </div>
                    </div>
                    
                    <div class="settings__search" style="
                        width: 100%; padding: 0; display: flex; flex-direction: row;">
                        <div class="settings__search__input" style="width: 100%;">${ search }</div>
                        
                        <div class="list__top__actions settings__search__menu">
                            <div class="list-top-nav__icon-button list-top-nav__icon-button_dark list-top-nav__icon-button_context">
                                <div class="button-input-wrapper button-input-more content__top__action__btn-more">
                                    <button type="button" class="button-input  button-input-with-menu" tabindex="" title="Еще">
                                        <span class="button-input-inner button-input-more-inner">
                                            <svg class="svg-icon svg-controls--button-more-dims">
                                                <use xlink:href="#controls--button-more"></use>
                                            </svg>
                                        </span>
                                    </button>
                        
                                    <ul class="button-input__context-menu ">
                                        <li class="button-input__context-menu__item  element__ js-list-export" id="export">
                                            <div class="button-input__context-menu__item__inner">
                                                <span class="button-input__context-menu__item__icon-container">
                                                    <svg class="button-input__context-menu__item__icon svg-icon svg-common--download-dims ">
                                                        <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#common--download"></use>
                                                    </svg>
                                                </span>
                                                <span class="button-input__context-menu__item__text">Экспорт</span>
                                            </div>
                                        </li>           
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    
                    <div class="settings__search__filter" style="position: relative; width: 100%;"></div>
                </div>
            `);

            // выравниваем фильтр и меню
            $('.settings__search .settings__search__input').css({
                'margin-top': '10px',
                'border-top': '1px solid #e8eaeb',
                'border-bottom': '1px solid #e8eaeb'
            });
            $('.settings__search .list-top-search').css({ 'margin-left': '0' });
            $('.settings__search .button-input').css({ 'border': '0', 'background': '#fff', 'max-height': 'auto' });
            $('.settings__search .settings__search__menu').css({ 'margin-top': '10px' });
            $('.settings__search .list-top-search__input').attr('readonly', true);
            $('.settings__search .list-top-search__input-block').css('cursor', 'pointer');
            $('.settings__search .list-top-search__input').css('cursor', 'pointer');

            $('.settings__search .settings__search__menu').css({
                'padding-left': '10px',
                'padding-right': '10px'
            });
            $('.settings__search .button-input__context-menu').css({'left': 'auto', 'right': '0'});

            // клик по свободному месту для закрытия фильтра
            $('#page_holder').unbind('click');
            $('#page_holder').bind('click', function (e) {
                // если фильтр не открыт, выходим
                if (!$('.settings__search__filter .js-filter-sidebar.filter-search').length) return;
                // если клик по диву фильтра, выходим
                if ($(e.target).closest('.settings__search__filter .js-filter-sidebar.filter-search').length) return;
                // если клик по инпуту фильтра, выходим
                if ($(e.target).hasClass('.settings__search .list-top-search__input-block')) return;
                if ($(e.target).closest('.settings__search .list-top-search__input-block').length) return;

                // удаляем фильтр
                $('.settings__search__filter .js-filter-sidebar.filter-search').remove();
            });

            // клик по фильтру
            $('.settings__search .list-top-search__input-block').unbind('click');
            $('.settings__search .list-top-search__input-block').bind('click', function () {
                if ($('.settings__search__filter .js-filter-sidebar.filter-search').length) return;

                $('.settings__search__filter').append(`
                    <div class="js-filter-sidebar filter-search visible" id="sidebar" style="width: calc(100% - 54px); position: absolute;">
                        <div class="filter-search__wrapper custom-scroll">
                            <div class="filter-search__inner">
                            
                            <div class="filter-search__left">
                                <ul class="filter-search__list js-filter-list" id="filter_list">
                    
                                    <li class="filter__list__item filter__list__item-system-preset js-filter__common_settings__item-sortable js-filter-preset-link" title="Все события">
                                        <span class="filter_items__handle"><span class="icon icon-v-dots"></span></span>
                                        <a href="/events/list/?skip_filter=Y&amp;sel=32042857&amp;preset=y" class="js-navigate-link filter__list__item__link">
                                            <span class="filter__list__item__inner">Все события</span>
                                        </a>
                                    </li>
                                    
                                    <li class="filter__list__item filter__list__item-system-preset js-filter__common_settings__item-sortable js-filter-preset-link" title="Мои события">
                                        <span class="filter_items__handle"><span class="icon icon-v-dots"></span></span>
                                        <a href="/events/list/?filter[main_user][]=8304874&amp;sel=32042860&amp;preset=y" class="js-navigate-link filter__list__item__link">
                                            <span class="filter__list__item__inner">Мои события</span>
                                        </a>
                                    </li>
                                    
                                    <li class="filter__list__item filter__list__item-system-preset js-filter__common_settings__item-sortable js-filter-preset-link" title="События за сегодня">
                                        <span class="filter_items__handle"><span class="icon icon-v-dots"></span></span>
                                        <a href="/events/list/?filter%5Bdate_preset%5D=current_day&amp;sel=32042863&amp;preset=y" class="js-navigate-link filter__list__item__link">
                                            <span class="filter__list__item__inner">События за сегодня</span>
                                        </a>
                                    </li>
                                    
                                    <li class="filter__list__item filter__list__item-system-preset js-filter__common_settings__item-sortable js-filter-preset-link " title="События за вчера">
                                        <span class="filter_items__handle"><span class="icon icon-v-dots"></span></span>
                                        <a href="/events/list/?filter%5Bdate_preset%5D=yesterday&amp;sel=32042866&amp;preset=y" class="js-navigate-link filter__list__item__link">
                                            <span class="filter__list__item__inner">События за вчера</span>
                                        </a>
                                    </li>
                                    
                                    <li class="filter__list__item filter__list__item-system-preset js-filter__common_settings__item-sortable js-filter-preset-link " title="События за месяц">
                                        <span class="filter_items__handle"><span class="icon icon-v-dots"></span></span>
                                        <a href="/events/list/?filter%5Bdate_preset%5D=current_month&amp;sel=32042869&amp;preset=y" class="js-navigate-link filter__list__item__link">
                                            <span class="filter__list__item__inner">События за месяц</span>
                                        </a>
                                    </li>
                                
                                </ul>
                            </div>
                            
                            <div class="filter-search__right">
                                <form action="/events/list/" method="GET" id="filter_form" class="filter__form">
                                    <div class="filter-search__form-wrapper">
                                        <div class="filter-search__entity-wrapper" data-element-type="events">
                                            <div class="filter__custom_settings__list" id="filter_fields">
                                            
                                                <div class="filter__custom_settings__item" data-tmpl="text">
                                                    <div class="filter__custom_settings__item__value-wrapper">
                                                        <div class="date_filter js-control-date-filter custom_select">
                                                            <div class="date_filter__head">
                                                                <div class="date_filter__head__icon">
                                                                    <svg class="svg-card-calendar-dims"><use xlink:href="#card-calendar"></use></svg>
                                                                </div>
                                                                <span class="date_filter__period custom_select__selected " data-before="За все время">
                                                                    За все время
                                                                </span>
                                                                <span class="date_filter__head__dropdown_icon"></span>
                                                            </div>
                                                            <div class="date_filter__dropdown ">
                                                                <div class="date_filter__param hidden">
                                                                    <div class="control-toggler date_filter__param__toggler hidden">
                                                                        <label for="filter_date_switch_created" class="control-toggler__item first control-toggler__item-selected" data-id="" data-label="Созданы">
                                                                            <input type="radio" class="hidden " id="filter_date_switch_created" checked="checked" name="filter_date_switch" value="created">  
                                                                            <b></b>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div class="date_filter__period_range__options">
                                                                        <div class="date_filter__period_range__controls ">
                                                                            <input type="hidden" class="date_field__preset" name="filter[date_preset]" value="">
                                                                            <span class="date_field_wrapper js-control-date date_filter__period_range__controls_field" data-kalendae-classname="">
                                                                                <input type="hidden" class="date_field__range_0" name="filter_date_from" value="">
                                                                                <input type="hidden" class="date_field__range_1" name="filter_date_to" value="">
                                                                                <input class="date_field js-date-filter-input date-filter-in-search empty range" type="text" value="" placeholder="">
                                                                                <div class="date_field_wrapper--calendar">
                                                                                    <svg class="svg-card-calendar-dims"><use xlink:href="#card-calendar"></use></svg>
                                                                                </div>
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <ul class="date_filter__period_list  without_button ">
                                                                        <li class="date_filter__period_item custom_select__item" data-period="" style="display:none;">
                                                                            <span data-value="" class="custom_select__title">
                                                                                За все время
                                                                            </span>
                                                                        </li>
                                                                        <li class="date_filter__period_item custom_select__item custom_select__item-current_day" data-period="current_day">
                                                                            <span data-value="current_day" class="custom_select__title" title="За сегодня">
                                                                                За сегодня
                                                                            </span>
                                                                        </li>
                                                                        <li class="date_filter__period_item custom_select__item custom_select__item-yesterday" data-period="yesterday">
                                                                            <span data-value="yesterday" class="custom_select__title" title="За вчера">
                                                                                За вчера
                                                                            </span>
                                                                        </li>
                                                                        <li class="date_filter__period_item custom_select__item custom_select__item-past_x_days" data-period="past_x_days">
                                                                            <span data-value="past_x_days" class="custom_select__title" "="">
                                                                                За последние 
                                                                                <div class="date_filter__period_item-input-days-wrapper">
                                                                                    <input class="date_filter__period_item-input-days js-date_filter__period_item js-control-autosized_input" data-comfort-zone="0" type="number" value="30" max="999">
                                                                                    <tester style="position: absolute; top: -9999px; left: -9999px; width: auto; font-size: 13px; font-family: &quot;PT Sans&quot;, Arial, sans-serif; font-weight: 400; font-style: normal; letter-spacing: 0px; text-transform: none; white-space: pre;">
                                                                                        30
                                                                                    </tester>
                                                                                </div> 
                                                                                дней
                                                                            </span>
                                                                        </li>
                                                                        <li class="date_filter__period_item custom_select__item custom_select__item-current_week" data-period="current_week">
                                                                            <span data-value="current_week" class="custom_select__title" title="За эту неделю">
                                                                                За эту неделю
                                                                            </span>
                                                                        </li>
                                                                        <li class="date_filter__period_item custom_select__item custom_select__item-previous_week" data-period="previous_week">
                                                                            <span data-value="previous_week" class="custom_select__title" title="За прошлую неделю">
                                                                                За прошлую неделю
                                                                            </span>
                                                                        </li>
                                                                        <li class="date_filter__period_item custom_select__item custom_select__item-current_month" data-period="current_month">
                                                                            <span data-value="current_month" class="custom_select__title" title="За этот месяц">
                                                                                За этот месяц
                                                                            </span>
                                                                        </li>
                                                                        <li class="date_filter__period_item custom_select__item custom_select__item-previous_month" data-period="previous_month">
                                                                            <span data-value="previous_month" class="custom_select__title" title="За прошлый месяц">
                                                                                За прошлый месяц
                                                                            </span>
                                                                        </li>
                                                                        <li class="date_filter__period_item custom_select__item custom_select__item-current_quarter" data-period="current_quarter">
                                                                            <span data-value="current_quarter" class="custom_select__title" title="За квартал">
                                                                                За квартал
                                                                            </span>
                                                                        </li>
                                                                        <li class="date_filter__period_item custom_select__item custom_select__item-current_year" data-period="current_year">
                                                                            <span data-value="current_year" class="custom_select__title" title="За этот год">
                                                                                За этот год
                                                                            </span>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <b class="js-filter-field-clear"></b>
                                                    </div>
                                                </div>                        
                                   
                                                <div class="filter-search__users-select-holder filter-search__users-select-holder_ filter__custom_settings__item filter__custom_settings__item_suggest-manager" data-title="Менеджеры" data-is-fn="usersSelectClear" data-type="" data-tmpl="users" data-element-type-name="" data-input-name="filter[main_user][]">
                                                    <div class="custom-scroll">
                                                        <div class="multisuggest users_select-select_one  js-multisuggest js-can-add " data-multisuggest-id="5834" id="filter_users_select__holder" data-new-item-msg="">
                                                            <ul class="multisuggest__list js-multisuggest-list"></ul>
                                                        </div>
                                                    </div>
                                                    <div class="filter__managers" style="width: 100%; border: 1px solid red; position: relative;"></div>
                                                    <b class="js-filter-field-clear"></b>
                                                </div>
                                            
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            
                            </div>
                        </div>
                    </div>
                `);


                $('.filter-search__right .custom-scroll').unbind('click');
                $('.filter-search__right .custom-scroll').bind('click', function () {
                    if ($('.filter-search__right .filter__managers .multisuggest__suggest-wrapper').length) return;

                    $('.filter-search__right .filter__managers').append(`
                        <div class="multisuggest__suggest-wrapper suggest-manager users-select-suggest filter__users-select-suggest" style="top: 0; left: 0; position: absolute; display: block; width: 300px; height: auto;" data-is-suggest="y">
                            <div class="multisuggest__suggest js-multisuggest-suggest custom-scroll" style="max-height: 300px;">
                                <div class="users-select-row"></div>
                            </div>
                        </div>
                    `);

                    // пользователи и группы
                    let groups = AMOCRM.constant('groups'),
                        managers = AMOCRM.constant('managers');

                    // перебираем группы и пользователей этих групп
                    $.each(groups, function (key, value) {
                        var users = [], groupID = key;

                        $.each(managers, function () {
                            if (this.group != key) return;
                            if (!this.active) return;

                            users.push({id: this.id, title: this.title});
                        });

                        // добавляем группу, если в ней есть пользователи
                        if (!users.length) return;

                        $('.filter-search__right .filter__managers .users-select-row').append(`
                            <div class="users-select-row__inner group-color-wrapper ">
                                <div class="users-select__head group-color  js-multisuggest-item multisuggest__suggest-item" data-title="${ value }" data-group="y" data-id="${ key }" style="height: 35px;">
                                    <div class="users-select__head-title" style="width: 293px;">
                
                                        <span class="users-select__head-title-text">${ value }</span>
                                        <div class="users-select__head-allgroup" data-id="${ key }">
                                            <span>Весь отдел</span>
                                        </div>
                
                                    </div>
                                </div>
                
                                <div class="users-select__body" data-id="${ key }"></div>
                            </div>                        
                        `);

                        $.each(users, function () {
                            $(`.filter-search__right .users-select__body[data-id=${ key }]`).append(`
                                <div class="users-select__body__item" id="select_users__user-${ this.id }">
                                    <div class="multisuggest__suggest-item js-multisuggest-item true" data-group="${ key }" data-id="${ this.id }">
                                        ${ this.title }
                                        <span data-id="${ this.id }" class="control-user_state"></span>
                                    </div>
                                </div>
                            `);
                        });
                    });

                    $('.filter-search__right .filter__managers').css({
                        'height': '300px'
                    });

                    $('.filter-search__right .filter__managers').css({
                        'overflow-x': 'hidden',
                        'overflow-y': 'auto'
                    });









                });

                $('.filter-search__right').append('<b>bb</b>');



            });




            // клик по меню экспорт
            $('.settings__search .settings__search__menu #export').unbind('click');
            $('.settings__search .settings__search__menu #export').bind('click', function (e) {
                console.log('export');
            });
        }

        /* ###################################################################### */

        this.callbacks = {
            settings: function() {
                self.accessRight();
                self.saveConfigSettings();

                // Блок первичных настроек и авторизации
                var _settings = self.get_settings();
                var data = '<div id="settings_WidgetBilling">Загружается...</div>';
                $('[id="settings_WidgetBilling"]').remove();
                $('#' + _settings.widget_code + '_custom_content').parent().after(data);
                var _secret = $('p.js-secret').attr('title');
                var _data = {};
                _data["domain"] = document.domain;
                _data["settings"] = _settings;
                _data["secret"] = _secret;
                _data["method"] = "settings";
                $.ajax({
                    url: url_link_t,
                    method: 'post',
                    data: _data,
                    dataType: 'html',
                    success: function(data) {
                        $('[id="settings_WidgetBilling"]').remove();
                        $('#' + _settings.widget_code + '_custom_content').parent().after(data);
                    }
                });
            },
            init: function() {
                return true;
            },
            bind_actions: function() {
                return true;
            },
            render: function() {
                // ссылка на запуск таймера
                if ((AMOCRM.getBaseEntity() === 'customers' || AMOCRM.getBaseEntity() === 'leads')
                    && AMOCRM.isCard()) {

                    self.render_template({
                        body: '',
                        caption: { class_name: 'widget__billing' },
                        render: `<a href="#" class="billing__link" style="
                            font-size: 16px;
                            text-decoration: none;
                            color: #1375ab;
                            margin-left: 12px;
                            margin-top: 10px;
                        ">Открыть таймер</a>`
                    });

                    // выравниваем картинку с блоком
                    $('.widget__billing .card-widgets__widget__caption__logo_min').css('padding', '0')
                    $('.widget__billing .card-widgets__widget__caption__logo_min').css('width', '100%')
                    $('.widget__billing .card-widgets__widget__caption__logo_min').css('height', '36px')
                    $('.widget__billing').next().css('padding', '10px 10px 0 10px');
                    $('.widget__billing .card-widgets__widget__caption__logo').css('margin', '0');
                    $('.widget__billing .card-widgets__widget__caption__logo').css('width', '100%');

                    // запускаем модалку с таймером
                    modalTimer();
                }

                return true;
            },
            contacts: {
                selected: function () {}
            },
            companies: {
                selected: function () {},
            },
            leads: {
                selected: function () {}
            },
            tasks: {
                selected: function() {}
            },
            destroy: function() {},
            onSave: function() {
                var _settings = self.get_settings();
                var data = '<div id="settings_WidgetBilling">Загружается...</div>';
                $('[id="settings_WidgetBilling"]').remove();
                $('#' + _settings.widget_code + '_custom_content').parent().after(data);
                var _secret = $('p.js-secret').attr('title');
                var _data = {};
                _data["domain"] = document.domain;
                _data["settings"] = _settings;
                _data["settings"]["active"] = "Y";
                _data["secret"] = _secret;
                _data["method"] = "settings";
                $.ajax({
                    url: url_link_t,
                    method: 'post',
                    data: _data,
                    dataType: 'html',
                    success: function(data) {
                        $('[id="settings_WidgetBilling"]').remove();
                        $('#' + _settings.widget_code + '_custom_content').parent().after(data);
                    }
                });

                return true;
            },
            advancedSettings: function() {
                // показ настроек в разделе Настройки
                self.advancedSettings();
            }
        };
        return this;
    };
    return CustomWidget_WidgetBilling;
});

// https://integratorgroup.k-on.ru/andreev/billing/token_get.php