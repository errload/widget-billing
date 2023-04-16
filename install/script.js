// billing
define(['jquery', 'underscore', 'twigjs', 'lib/components/base/modal'], function($, _, Twig, Modal) {
    let CustomWidget_WidgetBilling = function() {
        let self = this,
            system = self.system,
            url_link_t = 'https://integratorgroup.k-on.ru/andreev/billing/templates.php';

        this.config_settings = {}; // настройки виджета
        this.user_ID = null; // ID пользователя
        this.essense_ID = null; // сущность
        this.timezone = AMOCRM.constant('account').timezone; // timezone AMO
        this.filter_date = null; // даты для фильтра
        this.filter_managers = []; // сотрудники для фильтра
        this.price_manager = 0;

        // получаем настройки
        this.getConfigSettings = function () {
            let config_settings = self.get_settings().config_settings || {};
            if (typeof config_settings !== 'string') config_settings = JSON.stringify(config_settings);
            config_settings = JSON.parse(config_settings);
            self.config_settings = config_settings;

            return config_settings;
        }

        // сохраняем настройки
        this.saveConfigSettings = function () {
            $(`#${ self.get_settings().widget_code }_custom`).val(JSON.stringify(self.config_settings));
            $(`#${ self.get_settings().widget_code }_custom`).trigger('change');
        }

        // получение прав доступа
        const getRights = function () {
            let rights = null;

            if (self.config_settings.rights && self.config_settings.rights[self.user_ID]) {
                rights = self.config_settings.rights[self.user_ID];
            }

            return rights;
        }


        // название поле депозита из настроек
        this.getDepositTitle = function () {
            let deposit_title = '';
            self.getConfigSettings();

            if (self.config_settings.deposit_title && self.config_settings.deposit_title.length) {
                deposit_title = self.config_settings.deposit_title;
            }

            return deposit_title;
        }

        // очищаем интервалы
        this.clearIntervals = function () {
            let maxInterval = setInterval(() => {}, 1);
            for (let i = 0; i < maxInterval; i++) clearInterval(i);
        }

        /*
         *
         * ****************************************** EXPORT ***********************************************************
         *
         */

        // экспорт
        const exportTimers = function (IDs) {
            // модалка экспорта
            new Modal({
                class_name: 'modal__export__wrapper',
                init: function ($modal_body) {
                    var $this = $(this);
                    $modal_body
                        .trigger('modal:loaded')
                        .html(`<div class="modal__export" style="width: 100%; min-height: 180px;"></div>`)
                        .trigger('modal:centrify')
                        .append('');
                },
                destroy: function () {}
            });

            // кнопки отменить и Экспорт
            $('.modal__export').append(`
                <div class="modal-export__header">
                    <h3 class="modal-export__header-title">Экспорт</h3>
                    <div class="modal-export__header-buttons">
                        <button type="button" class="button-input button-cancel export__cancel__btn" tabindex="" style="">
                            <span>Отменить</span>
                        </button>
                        <button type="button" class="button-input button-input_blue modal-export__create-button 
                            export__export__btn" tabindex="">
                            <span class="button-input-inner">
                                <span class="button-input-inner__text">Экспорт</span>
                            </span>
                        </button>
                    </div>
                </div>
            `);

            // картинки экспорта
            $('.modal__export').append(`
                <div class="modal-export__formats">
                    <label class="modal-export__format" for="export_excel" style="cursor: auto;">
                        <div class="modal-export__format-icon">
                            <svg class="svg-icon svg-common--export--excel-dims">
                                <use xlink:href="#common--export--excel"></use>
                            </svg>
                        </div>
                        <div class="modal-export__format-content">
                            <div class="modal-export__format-title">Excel</div>
                            <div class="modal-export__format-text">Экспорт в файл формата Microsoft Excel</div>
                        </div>
                    </label>
                </div>
            `);

            // кнопка отменить
            $('.modal__export .export__cancel__btn').unbind('click');
            $('.modal__export .export__cancel__btn').bind('click', function () {
                $('.modal__export__wrapper').remove();
            });

            // кнопка экспорт
            $('.modal__export .export__export__btn').bind('click', function () {
                // отключаем кнопку
                $(this).unbind('click');
                // анимация выполнения кнопки
                btnSpinner('.modal__export .export__export__btn');

                // создаем excel файл на сервере
                $.ajax({
                    url: url_link_t,
                    method: 'POST',
                    data: {
                        'domain': document.domain,
                        'method': 'export',
                        'IDs': IDs
                    },
                    dataType: 'json',
                    success: function (data) {
                        // очищаем окно экспорта
                        if ($('.modal__export .modal-export__header').length) {
                            $('.modal__export .modal-export__header').remove();
                        }

                        if ($('.modal__export .modal-export__formats').length) {
                            $('.modal__export .modal-export__formats').remove();
                        }

                        // вставляем данные загрузки документа
                        $('.modal__export').append(`
                            <h2 class="modal-body__caption head_2">Экспорт завершен</h2>

                            <div class="modal-export__last-file" style="
                                display: flex; flex-direction: row; align-items: center;">
                                <svg class="svg-icon svg-common--export--load-file-dims" style="width: 29px; height: 35px;">
                                    <use xlink:href="#common--export--load-file"></use>
                                </svg>
                                <div class="modal-export__file-container" style="
                                    display: flex; flex-direction: column; flex: 1 0; align-items: 
                                    flex-start; margin-left: 8px;">
                                    <div class="modal-export__file-info" style="
                                        display: flex; width: 100%; justify-content: space-between;">
                                        <a class="modal-export__file-name" download="export_timers.xlsx" 
                                            href="https://integratorgroup.k-on.ru/andreev/billing/export_timers.xlsx">
                                            export_timers.xlsx
                                        </a>
                                        <span class="modal-export__file-size"></span>
                                    </div>
                                    <span class="modal-export__file-time" style="margin-left: 8px;"></span>
                                </div>
                            </div>

                            <div class="modal-body__actions">
                                <a download="export_timers.xlsx" 
                                    href="https://integratorgroup.k-on.ru/andreev/billing/export_timers.xlsx">
                                    <button type="button" class="button-input button-input_blue modal-export__save-button" 
                                        tabindex="">
                                        <span class="button-input-inner ">
                                            <svg class="svg-icon svg-common--export--download-dims">
                                                <use xlink:href="#common--export--download"></use>
                                            </svg>
                                            <span class="button-input-inner__text">Скачать файл</span>
                                        </span>
                                    </button>
                                </a>
                            </div>
                        `);

                        $('.modal__export').css('min-height', '150px');

                        // размер файла
                        $('.modal-export__file-container .modal-export__file-size').text(`
                            ${ data.filesize } / ${ data.count } строк
                        `);

                        // дата создания файла
                        $('.modal-export__file-container .modal-export__file-time').text(`
                            ${ data.date } в ${ data.time }
                        `);
                    },
                    timeout: 2000
                });
            });
        }

        /*
         *
         * ****************************************** TIMER RIGHT MENU *************************************************
         *
         */

        // анимация выполнения кнопки
        const btnSpinner = function (class_btn) {
            $(`${ class_btn }`).addClass('button-input-loading');
            $(`${ class_btn }`).attr('data-loading', 'Y');
            $(`${ class_btn } .button-input-inner`).css('display', 'none');
            $(`${ class_btn }`).append(`
                    <div class="button-input__spinner">
                        <span class="button-input__spinner__icon spinner-icon spinner-icon-white"></span>
                    </div>
                `);
            $(`${ class_btn }`).unbind('click');
        }


        // отображаем таймер в меню
        const getTimersInfo = function () {
            // очищаем прошлые значение
            if ($('.billing__timers .timer__items').length) $('.billing__timers .timer__items').remove();

            // кнопка таймера
            let billing_link_btn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                class_name: 'billing__link__btn',
                text: 'Открыть таймер'
            });

            // рендер таймера
            let render = `
                <div class="billing__timers" style="
                    display: flex; flex-direction: column; padding-bottom: 5px; margin-bottom: 10px;
                    border-bottom: 3px solid #ffffff;">
                    <div class="timer__link" style="margin-top: 7px;">
                        <a href="" class="billing__link">${ billing_link_btn }</a>
                    </div>
                </div>
            `;

            if (!$('.widget__billing').length) {
                self.render_template({
                    body: '',
                    caption: {class_name: 'widget__billing'},
                    render: render
                });
            }

            // выравниваем картинку с блоком
            $('.widget__billing .card-widgets__widget__caption__logo_min').css('padding', '0')
            $('.widget__billing .card-widgets__widget__caption__logo_min').css('width', '100%')
            $('.widget__billing .card-widgets__widget__caption__logo_min').css('height', '36px')
            $('.widget__billing').next().css('padding', '10px 10px 0 10px');
            $('.widget__billing .card-widgets__widget__caption__logo').css('margin', '0');
            $('.widget__billing .card-widgets__widget__caption__logo').css('width', '100%');
            $('.billing__timers .billing__link__btn').css('width', '100%');

            // поиск запущенных таймеров
            let essense_ID = AMOCRM.data.current_card.id; // ущность
            let user_ID = AMOCRM.constant('user').id; // ID пользователя

            $.ajax({
                url: url_link_t,
                method: 'POST',
                data: {
                    'domain': document.domain,
                    'method': 'search_timers',
                    'essense_ID': essense_ID,
                    'user_ID': user_ID
                },
                dataType: 'json',
                success: function (data) {
                    if (!data || !data.length) {
                        $('.billing__timers').prepend(`
                            <div class="timer__items" style="text-align: center; margin-bottom: 3px;">
                                Таймеров нет
                            </div>
                        `);

                        return;
                    }

                    $.each(data, function () {
                        if (this.status === 'pause') {
                            $('.billing__timers .timer__link').before(`
                                <div class="timer__items" style="display: flex; flex-direction: row; margin-bottom: 3px;
                                    justify-content: center; background: #ffffff; color: #000000;">
                                    <div class="items__time" style="padding: 3px 10px;">
                                        ${ this.time_work }
                                    </div>
                                    <div class="items__icon" style="padding-top: 4px;">
                                        <svg data-name="Layer 1" height="18" id="Layer_1" viewBox="0 0 200 200" 
                                            width="18" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100,15a85,85,0,1,0,85,85A84.93,84.93,0,0,0,100,15Zm0,150a65,
                                                65,0,1,1,65-65A64.87,64.87,0,0,1,100,165ZM120,60a10,10,0,0,0-10,10v60a10,
                                                10,0,0,0,20,0V70A10,10,0,0,0,120,60ZM80,60A10,10,0,0,0,70,70v60a10,
                                                10,0,0,0,20,0V70A10,10,0,0,0,80,60Z"/>
                                        </svg>
                                    </div>
                                </div>
                            `);
                        }

                        else if (this.status === 'stop') {
                            $('.billing__timers .timer__link').before(`
                                <div class="timer__items" style="display: flex; flex-direction: row; margin-bottom: 3px;
                                    justify-content: center; background: #ffffff; color: #000000;">
                                    <div class="items__time" style="padding: 3px 10px;">
                                        ${ this.time_work }
                                    </div>
                                    <div class="items__icon" style="padding-top: 4px;">
                                        <svg height="16" viewBox="0 0 512 512" width="16" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M328 160h-144C170.8 160 160 170.8 160 184v144C160 341.2 170.8 352 
                                            184 352h144c13.2 0 24-10.8 24-24v-144C352 170.8 341.2 160 328 160zM256 
                                            0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 
                                            0zM256 464c-114.7 0-208-93.31-208-208S141.3 48 256 48s208 93.31 208 208S370.7 
                                            464 256 464z"/><
                                        /svg>
                                    </div>
                                </div>
                            `);
                        }

                        else if (this.status === 'start') {
                            $('.billing__timers .timer__link').before(`
                                <div class="timer__items timer__interval" style="display: flex; flex-direction: row; margin-bottom: 3px;
                                    justify-content: center; background: #ffffff; color: #000000;">
                                    <div class="items__time" style="padding: 3px 10px;">
                                        ${ this.time_work }
                                    </div>
                                    <div class="items__icon" style="padding-top: 4px;">
                                        <svg height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0 0h48v48H0z" fill="none"/>
                                            <path d="M20 33l12-9-12-9v18zm4-29C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 
                                                20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 
                                                16-7.18 16-16 16z"/>
                                        </svg>
                                    </div>
                                </div>
                            `);

                            // запускаем интервал
                            let date = new Date(), time = null;

                            time = this.time_work.split(':');
                            date.setHours(time[0]);
                            date.setMinutes(time[1]);
                            date.setSeconds(time[2]);

                            setInterval(() => {
                                // +1 сек к времени в интервале
                                date.setSeconds(date.getSeconds() + 1);
                                $('.billing__timers .timer__items.timer__interval .items__time').text(
                                    date.toLocaleTimeString()
                                );
                            }, 1000);
                        }
                    });
                },
                timeout: 2000
            });
        }

        /*
         *
         * ****************************************** TIMER ************************************************************
         *
         */

        // запуск модалки
        const timerOpen = function () {
            new Modal({
                class_name: 'modal__timer__wrapper',
                init: function ($modal_body) {
                    let $this = $(this);
                    $modal_body
                        .trigger('modal:loaded')
                        .html(`
                        <div class="modal__timer" style="width: 100%; min-height: 250px;">
                            <h2 class="modal__body__caption head_2">Таймер</h2>
                        </div>
                    `)
                        .trigger('modal:centrify')
                        .append('');
                },
                destroy: function () {}
            });
        }

        // отступ снизу
        const marginBottom = function (modal) {
            $(`.${ modal }`).append(`
                <div style="position: relative; width: 100%;">
                    <div style="width: 100%; height: 80px; position: absolute;"></div>
                </div>
            `);
        }

        // ссылка на проект
        const addLinkProject = function (rights) {
            $('.modal__timer').append(`
                <div class="link__project__wrapper" style="width: 100%; margin-top: 20px;">
                    <span style="width: 100%;">Ссылка на проект:</span><br/>
                </div>
            `);

            $.ajax({
                url: url_link_t,
                method: 'POST',
                data: {
                    'domain': document.domain,
                    'method': 'get_link_project',
                    'essence_ID': self.essense_ID
                },
                dataType: 'json',
                success: function (data) {
                    // если ссылка в БД есть, добавляем
                    if (data.length) {
                        $('.modal__timer .link__project__wrapper').append(`
                            <a href="${ data }" class="link__project" style="margin-top: 3px; 
                                text-decoration: none; color: #1375ab; word-break: break-all;" target="_blank">
                                ${ data }
                            </a>
                        `);
                    }

                    // проверка прав на редактирование
                    if (rights && rights.includes('is_edit_link')) {
                        $('.modal__timer .link__project__wrapper').append(`
                            <a href="" class="edit__link__project" style="text-decoration: none; color: #6b6d72;">
                                &nbsp;(изменить)
                            </a>
                        `);

                        // редактирование ссылки на проект
                        $('.modal__timer .edit__link__project').unbind('click');
                        $('.modal__timer .edit__link__project').bind('click', editLinkProject);
                    }
                },
                timeout: 2000
            });
        }

        // редактирование ссылки на проект
        const editLinkProject = function (e) {
            e.preventDefault();

            // поле ввода изменения ссылки на проект
            let input_link_project = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                name: 'input-link-project',
                class_name: 'input__link__project',
                value: '',
                placeholder: 'вставьте ссылку на проект'
            });

            // замена ссылки на поле ввода
            $('.modal__timer .link__project__wrapper').append(input_link_project);
            $('.modal__timer .input__link__project').css({ 'width': '100%', 'margin-top': '3px' }).focus();
            $('.modal__timer .input__link__project').val($('.modal__timer .link__project').text().trim());
            $('.modal__timer .link__project').remove();
            $('.modal__timer .edit__link__project').remove();

            // обновление ссылки в БД
            $('.modal__timer .input__link__project').bind('focusout', updateLinkProject);
        }

        // обновление ссылки в БД
        const updateLinkProject = function (e) {
            e.preventDefault();

            $.ajax({
                url: url_link_t,
                method: 'POST',
                data: {
                    'domain': document.domain,
                    'method': 'edit_link_project',
                    'essence_ID': self.essense_ID,
                    'link_project': $('.modal__timer .input__link__project').val().trim()
                },
                dataType: 'json',
                success: function (data) {
                    // обновленная ссылка
                    $('.modal__timer .link__project__wrapper').append(`
                        <a href="${ data }" class="link__project" style="margin-top: 3px; 
                            text-decoration: none; color: #1375ab; word-break: break-all;" target="_blank">
                            ${ data }
                        </a>
                        <a href="" class="edit__link__project" style="text-decoration: none; color: #6b6d72;">
                            &nbsp;(изменить)
                        </a>
                    `);

                    // удаляем поля ввода
                    $('.modal__timer .input__link__project').remove();
                    // редактирование ссылки на проект
                    $('.modal__timer .edit__link__project').unbind('click');
                    $('.modal__timer .edit__link__project').bind('click', editLinkProject);
                },
                timeout: 2000
            });
        }

        // ссылка на добавление таймера
        const linkAddTimer = function () {
            $('.modal__timer').append(`
                <div class="link__add__timer__wrapper" style="width: 100%; margin-top: 10px; position: relative;">
                    <a href="" class="link__add__timer" style="text-decoration: none; color: #1375ab;">
                        Добавить таймер
                    </a>
                </div>
            `);

            // отступ снизу
            marginBottom('modal__timer');

            // добавление таймера
            $('.modal__timer .link__add__timer').unbind('click');
            $('.modal__timer .link__add__timer').bind('click', function (e) {
                e.preventDefault();
                addTimer();
            });
        }

        // отображение запущенных таймеров, или нового
        const getTimers = function () {
            $.ajax({
                url: url_link_t,
                method: 'POST',
                data: {
                    'domain': document.domain,
                    'method': 'get_timers',
                    'essence_ID': self.essense_ID,
                    'user_ID': self.user_ID
                },
                dataType: 'json',
                success: function (data) {
                    // если для сущности и пользователя таймеров нет, создаем новый
                    if (!data.length) {
                        addTimer();

                        // показываем кнопку старта
                        $('.modal__timer .timer__time').text('00:00:00');
                        $('.modal__timer .timer__start__btn').css('display', 'block');
                        $('.modal__timer .timer__pause__btn').css('display', 'none');
                        $('.modal__timer .timer__stop__btn').css('display', 'none');
                    }

                    // иначе отображаем
                    else {
                        $.each(data, function () {
                            let timer_ID = this[0], link_task = this[8], time_work = this[12], status = this[13];

                            // добавляем таймер
                            addTimer(timer_ID, link_task);

                            // обновляем время
                            let date = new Date();
                            let time = time_work.split(' ');

                            time = time[1].split(':');
                            date.setHours(time[0]);
                            date.setMinutes(time[1]);
                            date.setSeconds(time[2]);

                            $(`.timer__item[data-id="${ timer_ID }"] .timer__time`).text(date.toLocaleTimeString());

                            if (status === 'pause') {
                                $(`.timer__item[data-id="${ timer_ID }"] .timer__start__btn`).css('display', 'block');
                                $(`.timer__item[data-id="${ timer_ID }"] .timer__pause__btn`).css('display', 'none');
                                $(`.timer__item[data-id="${ timer_ID }"] .timer__stop__btn`).css('display', 'block');
                            }

                            if (status === 'stop') {
                                $(`.timer__item[data-id="${ timer_ID }"] .timer__start__btn`).css('display', 'none');
                                $(`.timer__item[data-id="${ timer_ID }"] .timer__pause__btn`).css('display', 'none');
                                $(`.timer__item[data-id="${ timer_ID }"] .timer__stop__btn`).css('display', 'block');
                                $(`.timer__item[data-id="${ timer_ID }"] .timer__stop__btn`).text('Сохранить');

                                // событие на кнопку завершения
                                $(`.timer__item[data-id="${ timer_ID }"] .timer__stop__btn`).unbind('click');
                                $(`.timer__item[data-id="${ timer_ID }"] .timer__stop__btn`).bind('click', function () {
                                    timerFinish(timer_ID);
                                });
                            }

                            // если таймер запущен, запускаем интервал
                            if (status === 'start') {
                                $(`.timer__item[data-id="${ timer_ID }"] .timer__start__btn`).css('display', 'none');
                                $(`.timer__item[data-id="${ timer_ID }"] .timer__pause__btn`).css('display', 'block');
                                $(`.timer__item[data-id="${ timer_ID }"] .timer__stop__btn`).css('display', 'block');

                                startInterval(date, timer_ID);
                            }
                        });
                    }
                },
                timeout: 2000
            });
        }

        // запуск интервала
        const startInterval = function (date, timer_ID) {
            let interval = setInterval(() => {
                // если время максимальное, останавливаем таймер
                if (date.getHours() === 23 && date.getMinutes() === 59 && date.getSeconds() === 59) {
                    // очищаем интервалы
                    clearInterval(interval);
                    // перезапускаем таймеры в меню
                    getTimersInfo();

                    // показываем кнопку сохранить
                    $(`.timer__item[data-id="${ timer_ID }"] .timer__start__btn`).css('display', 'none');
                    $(`.timer__item[data-id="${ timer_ID }"] .timer__pause__btn`).css('display', 'none');
                    $(`.timer__item[data-id="${ timer_ID }"] .timer__stop__btn`).css('display', 'block');
                    $(`.timer__item[data-id="${ timer_ID }"] .timer__stop__btn`).text('Сохранить');

                    // обновляем время на сервере на максимальное
                    $.ajax({
                        url: url_link_t,
                        method: 'POST',
                        data: {
                            'domain': document.domain,
                            'method': 'timer_auto_stop',
                            'timer_ID': timer_ID
                        },
                        dataType: 'json',
                        success: function (data) {},
                        timeout: 2000
                    });

                    // событие на кнопку завершения
                    $(`.timer__item[data-id="${ timer_ID }"] .timer__stop__btn`).unbind('click');
                    $(`.timer__item[data-id="${ timer_ID }"] .timer__stop__btn`).bind('click', function () {
                        timerFinish(timer_ID);
                    });

                    return false;
                }

                // +1 сек к времени в интервале
                date.setSeconds(date.getSeconds() + 1);
                $(`.timer__item[data-id="${ timer_ID }"] .timer__time`).text(date.toLocaleTimeString());
            }, 1000);
        }

        // добавление таймера
        const addTimer = function (timer_ID = null, link_task = null) {
            // если таймер добавлен и не запущен, выходим
            if ($('.modal__timer .timer__item[data-id="new_timer_ID"]').length) {
                $('.modal__timer .input__link__task').focus();
                return false;
            }

            // если ID не передан, создаем временный
            if (!timer_ID) timer_ID = 'new_timer_ID';

            // ссылка на задачу
            let input_link_task = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                name: 'input-link-task',
                class_name: 'input__link__task',
                value: '',
                placeholder: 'вставьте ссылку на задачу'
            });

            // кнопки таймера
            let timer_start_btn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                    class_name: 'timer_btns timer__start__btn',
                    text: 'Старт',
                }),
                timer_pause_btn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                    class_name: 'timer_btns timer__pause__btn',
                    text: 'Пауза',
                }),
                timer_stop_btn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                    class_name: 'timer_btns timer__stop__btn',
                    text: 'Стоп',
                });

            // вставляем таймер перед ссылкой
            $('.modal__timer .link__add__timer__wrapper').before(`
                <div class="timer__item" data-id="${ timer_ID }" style="width: 100%;">
                    <div class="input__link__task__wrapper" style="width: 100%; margin-top: 15px;">
                        <span style="width: 100%;">Ссылка на задачу:</span><br/>
                        ${ input_link_task }
                    </div>
                    <div class="btns__item__wrapper" style="width: 100%; margin-top: 10px; display: flex; 
                        flex-direction: row;">
                        <span style="font-size: 24px; margin-right: 20px;" class="timer__time">00:00:00</span>
                        <div class="timer__buttons" style="display: flex; flex-direction: row;">
                            ${ timer_start_btn } ${ timer_pause_btn } ${ timer_stop_btn }
                        </div>
                    </div>
                </div>
            `);

            // выравниваем кнопки и инпут
            $(`.timer__item[data-id="${ timer_ID }"] .input__link__task`).css({ 'width': '100%', 'margin-top': '3px' });
            $(`.timer__item[data-id="${ timer_ID }"] .timer__start__btn`).css({
                'margin-left': '5px', 'margin-top': '-2px', 'width': '100px', 'display': 'block'
            });
            $(`.timer__item[data-id="${ timer_ID }"] .timer__pause__btn`).css({
                'margin-left': '5px', 'margin-top': '-2px', 'width': '100px', 'display': 'none'
            });
            $(`.timer__item[data-id="${ timer_ID }"] .timer__stop__btn`).css({
                'margin-left': '5px', 'margin-top': '-2px', 'width': '100px', 'display': 'none'
            });

            // возвращаем нормальный цвет ссылки в случае ошибки
            $(`.timer__item[data-id="${ timer_ID }"] .input__link__task`).unbind('input');
            $(`.timer__item[data-id="${ timer_ID }"] .input__link__task`).bind('input', () => {
                $(`.timer__item[data-id="${ timer_ID }"] .input__link__task`).css('border-color', '#dbdedf');
            });

            // показываем актуальную ссылку на задачу, если таймер был запущен ранее
            if (!link_task) {
                $(`.timer__item[data-id="${ timer_ID }"] .input__link__task`).val('');
                $(`.timer__item[data-id="${ timer_ID }"] .input__link__task`).focus();
            }
            else {
                $(`.timer__item[data-id="${ timer_ID }"] .input__link__task`).val(link_task);
                $(`.timer__item[data-id="${ timer_ID }"] .input__link__task`).css('display', 'none');
                $(`.timer__item[data-id="${ timer_ID }"] .input__link__task__wrapper`).append(`
                    <a href="${ link_task }" class="link__task" style="
                        margin-top: 3px; text-decoration: none; color: #1375ab; word-break: break-all;" target="_blank">
                        ${ link_task }
                    </a>
                `);
            }

            // события кнопок
            timerStart();
            timerPause();
            timerStop();
        }

        // старт таймера
        const timerStart = function (e) {
            $('.modal__timer .timer__start__btn').unbind('click');
            $('.modal__timer .timer__start__btn').bind('click', function (e) {
                // ID таймера
                let timer_ID = $(e.target).closest('.timer__item').attr('data-id');

                // если ссылки на задачу нет, отключаем кнопку
                if ($(`.timer__item[data-id="${ timer_ID }"] .input__link__task`).val().trim().length === 0) {
                    $(`.timer__item[data-id="${ timer_ID }"] .input__link__task`).css('border-color', '#f37575');
                    $(`.timer__item[data-id="${ timer_ID }"] .input__link__task`).val('').focus();
                    return false;
                }

                // прячем кнопку старт
                $(`.timer__item[data-id="${ timer_ID }"] .timer__start__btn`).css('display', 'none');
                // очищаем интервалы
                self.clearIntervals();

                // сохраняем/обновляем таймер в БД
                $.ajax({
                    url: url_link_t,
                    method: 'POST',
                    data: {
                        'domain': document.domain,
                        'method': 'timer_start',
                        'essence_ID': self.essense_ID,
                        'user_ID': self.user_ID,
                        'link_task': $(`.timer__item[data-id="${ timer_ID }"] .input__link__task`).val().trim(),
                        'timezone': self.timezone,
                        'timer_ID': timer_ID
                    },
                    dataType: 'json',
                    success: function (data) {
                        // присваиваем таймеру ID записи
                        $(`.timer__item[data-id="${ timer_ID }"]`).attr('data-id', data.id);

                        // ставим все запущенные таймеры на паузу
                        $.each($('.modal__timer .timer__item'), function () {
                            // пропускаем текущий
                            if ($(this).attr('data-id') === data.id) return;

                            if ($(this).find('.timer__pause__btn').css('display') === 'block') {
                                // показываем кнопки старт и стоп
                                $(this).find('.timer__start__btn').css('display', 'block');
                                $(this).find('.timer__pause__btn').css('display', 'none');
                                $(this).find('.timer__stop__btn').css('display', 'block');
                            }
                        });

                        // показываем кнопки паузы и стоп
                        $(`.timer__item[data-id="${ data.id }"] .timer__pause__btn`).css('display', 'block');
                        $(`.timer__item[data-id="${ data.id }"] .timer__stop__btn`).css('display', 'block');

                        // обновляем ссылку на задачу
                        $(`.timer__item[data-id="${ data.id }"] .input__link__task`).val(data.link_task);
                        $(`.timer__item[data-id="${ data.id }"] .input__link__task`).css('display', 'none');

                        if (!$(`.timer__item[data-id="${ data.id }"] .link__task`).length) {
                            $(`.timer__item[data-id="${ data.id }"] .link__task__wrapper`).append(`
                                <a href="${ data.link_task }" class="link__task" style="
                                    margin-top: 3px; text-decoration: none; color: #1375ab; 
                                    word-break: break-all;" target="_blank">
                                    ${ data.link_task }
                                </a>
                            `);
                        }

                        // обновляем время
                        let date = new Date(),
                            time = data.time_work.split(' ');

                        time = time[1].split(':');
                        date.setHours(time[0]);
                        date.setMinutes(time[1]);
                        date.setSeconds(time[2]);

                        // запускаем интервал
                        startInterval(date, data.id);
                        // перезапускаем таймеры в меню
                        getTimersInfo();
                    },
                    timeout: 2000
                });
            });
        }

        // пауза таймера
        const timerPause = function (e) {
            $('.modal__timer .timer__pause__btn').unbind('click');
            $('.modal__timer .timer__pause__btn').bind('click', function (e) {
                // очищаем интервалы
                self.clearIntervals();

                // ID таймера
                let timer_ID = $(e.target).closest('.timer__item').attr('data-id');

                // показываем кнопки старт и стоп
                $(`.timer__item[data-id="${ timer_ID }"] .timer__start__btn`).css('display', 'block');
                $(`.timer__item[data-id="${ timer_ID }"] .timer__pause__btn`).css('display', 'none');
                $(`.timer__item[data-id="${ timer_ID }"] .timer__stop__btn`).css('display', 'block');

                // обновляем значение таймера на сервере
                $.ajax({
                    url: url_link_t,
                    method: 'POST',
                    data: {
                        'domain': document.domain,
                        'method': 'timer_pause',
                        'timer_ID': timer_ID
                    },
                    dataType: 'json',
                    success: function (data) {
                        // перезапускаем таймеры в меню
                        getTimersInfo();
                    },
                    timeout: 2000
                });
            });
        }

        // стоп таймера
        const timerStop = function (e) {
            $('.modal__timer .timer__stop__btn').unbind('click');
            $('.modal__timer .timer__stop__btn').bind('click', function (e) {
                // ID таймера
                let timer_ID = $(e.target).closest('.timer__item').attr('data-id');

                // если текущий таймер запущен, очищаем интервалы
                if ($(`.timer__item[data-id="${ timer_ID }"] .timer__pause__btn`).css('display') === 'block') {
                    self.clearIntervals();
                }

                // показываем кнопку сохранить
                $(`.timer__item[data-id="${ timer_ID }"] .timer__start__btn`).css('display', 'none');
                $(`.timer__item[data-id="${ timer_ID }"] .timer__pause__btn`).css('display', 'none');
                $(`.timer__item[data-id="${ timer_ID }"] .timer__stop__btn`).css('display', 'block');
                $(`.timer__item[data-id="${ timer_ID }"] .timer__stop__btn`).text('Сохранить');

                // обновляем значение таймера на сервере
                $.ajax({
                    url: url_link_t,
                    method: 'POST',
                    data: {
                        'domain': document.domain,
                        'method': 'timer_stop',
                        'timer_ID': timer_ID
                    },
                    dataType: 'json',
                    success: function (data) {
                        // перезапускаем таймеры в меню
                        getTimersInfo();
                    },
                    timeout: 2000
                });

                // событие на кнопку завершения
                $(`.timer__item[data-id="${ timer_ID }"] .timer__stop__btn`).unbind('click');
                $(`.timer__item[data-id="${ timer_ID }"] .timer__stop__btn`).bind('click', function () {
                    timerFinish(timer_ID);
                });

                // модалка завершения таймера
                timerFinish(timer_ID);
            });
        }

        // модалка завершения таймера
        const timerFinish = function (timer_ID) {
            new Modal({
                class_name: 'modal__finish__wrapper',
                init: function ($modal_body) {
                    let $this = $(this);
                    $modal_body
                        .trigger('modal:loaded')
                        .html(`
                            <div class="modal__finish" style="width: 100%; min-height: 385px;">
                                <h2 class="modal__body__caption head_2">Сохранение таймера</h2>
                            </div>
                        `)
                        .trigger('modal:centrify')
                        .append('');
                },
                destroy: function () {}
            });

            addFinishEmploee(); // выбор ответственного
            getClients(); // имя клиента
            getServices(); // выбор услуги
            addComment(); // комментарий

            // кнопки Сохранить и Закрыть
            let finish_save_btn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                    class_name: 'finish__save__btn button-input_blue',
                    text: 'Сохранить'
                }),
                finish_cancel_btn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
                    class_name: 'finish__cancel__btn',
                    text: 'Закрыть'
                });

            $('.modal__finish').append(`
                <div class="modal__body__actions__timer__finish" style="width: 100%; margin-top: 20px;">
                    ${ finish_save_btn } ${ finish_cancel_btn }
                </div>
            `);

            // сохранение таймера в БД
            timerSave(timer_ID);
        }

        // выбор ответственного
        const addFinishEmploee = function () {
            let managers = [];
            managers.push({ id: 'null', option: 'Выберите ответственного' });

            $.each(AMOCRM.constant('managers'), function () {
                if (!this.active) return;
                managers.push({ id: this.id, option: this.title });
            });

            // селект с сотрудниками
            let select_managers = Twig({ ref: '/tmpl/controls/select.twig' }).render({
                items: managers,
                class_name: 'select__managers'
            });

            $('.modal__finish').append(`
                <div class="managers__wrapper" style="width: 100%; margin-top: 20px;">
                    <span style="width: 100%;">Выбор ответственного:</span><br/>
                    ${ select_managers }
                </div>
            `);

            $('.modal__finish .select__managers').css('margin-top', '3px');
            $('.modal__finish .select__managers .control--select--button').css('width', '100%');
            $('.modal__finish .select__managers ul').css({
                'margin-left': '13px',
                'width': 'auto',
                'min-width': $('.modal__finish').outerWidth() - 13
            });
        }

        // имя клиента
        const getClients = function () {
            let clients = [];
            clients.push({ id: 'null', option: 'Выберите клиента' });

            $('.modal__finish').append(`
                <div class="clients__wrapper" style="width: 100%; margin-top: 20px;">
                    <span style="width: 100%;">Выбор клиента:</span><br/>
                </div>
            `);

            $.ajax({
                url: url_link_t,
                method: 'POST',
                data: {
                    'domain': document.domain,
                    'method': 'get_clients',
                    'essence_ID': self.essense_ID
                },
                dataType: 'json',
                success: function (data) {
                    $.each(data, function () { clients.push({ id: this[0], option: this[1] }) });
                    clients.push({ id: 'my_option', option: 'Добавить свой вариант' });

                    // селект с клиентами
                    let select_clients = Twig({ ref: '/tmpl/controls/select.twig' }).render({
                        items: clients,
                        class_name: 'select__clients'
                    });

                    $('.modal__finish .clients__wrapper').append(select_clients);
                    $('.modal__finish .select__clients').css('margin-top', '3px');
                    $('.modal__finish .select__clients .control--select--button').css('width', '100%');
                    $('.modal__finish .select__clients ul').css({
                        'margin-left': '13px',
                        'width': 'auto',
                        'min-width': $('.modal__finish').outerWidth() - 13
                    });

                    // выбор клиента
                    $('.modal__finish .select__clients ul li').unbind('click');
                    $('.modal__finish .select__clients ul li').bind('click', function () {
                        // если выбор варианта, вставляем поле ввода
                        if ($(this).find('.control--select--list--item-inner').text().trim() === 'Добавить свой вариант') {
                            let input_client_name = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                                name: 'input-client-name',
                                class_name: 'input__client__name',
                                value: '',
                                placeholder: 'введите имя клиента'
                            });

                            // меняем селект на поле ввода
                            $('.modal__finish .clients__wrapper span').after(input_client_name);
                            $('.modal__finish .input__client__name').css({ 'width': '100%', 'margin-top': '3px' });
                            $('.modal__finish .select__clients').remove();
                            $('.modal__finish .input__client__name').focus();
                        }
                    });
                },
                timeout: 2000
            });
        }

        // список услуг
        const getServices = function () {
            let services = [];
            services.push({ id: 'null', option: 'Выберите оказанную услугу' });

            $('.modal__finish .clients__wrapper').after(`
                <div class="services__wrapper" style="width: 100%; margin-top: 20px;">
                    <span style="width: 100%;">Список оказанных услуг:</span><br/>
                </div>
            `);

            $.ajax({
                url: url_link_t,
                method: 'POST',
                data: {
                    'domain': document.domain,
                    'method': 'get_services'
                },
                dataType: 'json',
                success: function (data) {
                    $.each(data, function () { services.push({ id: this[0], option: this[1] }) });

                    // селект с клиентами и кнопка редактировать
                    let rights = null,
                        select_services = Twig({ ref: '/tmpl/controls/select.twig' }).render({
                            items: services,
                            class_name: 'select__services'
                        }),
                        edit_services_btn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                            class_name: 'edit__services__btn',
                            text: 'Редактировать'
                        });

                    $('.modal__finish .services__wrapper').append(`
                        <div class="services__flex" style="display: flex; flex-direction: row; padding-top: 3px;">
                            <div class="services__select" style="width: 70%;">
                                ${ select_services }
                            </div>
                            <div class="services__button" style="width: 30%; text-align: right;">
                                ${ edit_services_btn }
                            </div>
                        </div>
                    `);

                    $('.modal__finish .select__services .control--select--button').css('width', '100%');
                    $('.modal__finish .select__services ul').css({
                        'margin-left': '13px',
                        'width': 'auto',
                        'min-width': $('.modal__finish').outerWidth() - 13
                    });

                    // проверка прав на редактирование
                    rights = getRights();

                    if (!rights || !rights.includes('is_edit_services')) {
                        $('.modal__finish .services__select').css('width', '100%');
                        $('.modal__finish .services__button').remove();
                    }

                    // редактирование списка услуг
                    $('.modal__finish .edit__services__btn').unbind('click');
                    $('.modal__finish .edit__services__btn').bind('click', function () {
                        editSerives(services);
                    });
                },
                timeout: 2000
            });
        }

        // редактирование списка услуг
        const editSerives = function (services) {
            new Modal({
                class_name: 'modal__edit__serives__wrapper',
                init: function ($modal_body) {
                    let $this = $(this);
                    $modal_body
                        .trigger('modal:loaded')
                        .html(`
                            <div class="modal__edit__serives" style="width: 100%; min-height: 450px;">
                                <h2 class="modal__body__caption head_2" style="margin-bottom: 10px;">
                                    Редактирование оказанных услуг
                                </h2>
                            </div>
                        `)
                        .trigger('modal:centrify')
                        .append('');
                },
                destroy: function () {}
            });

            // ссылка добавления варианта
            $('.modal__edit__serives').append(`
                <a href="" class="link__add__service" style="
                    text-decoration: block; color: #1375ab; margin-top: 10px; margin-left: 3px;">
                    Добавить вариант
                </a>
            `);

            // добавление варианта
            const add_service = function (id = null, option = null) {
                let input_edit_service = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                    name: 'input-edit-service',
                    class_name: 'input__edit__service',
                    value: option,
                    placeholder: 'Вариант',
                    max_length: 50
                });

                // вставляем и ровняем поле ввода и кнопку удаления
                $('.modal__edit__serives .link__add__service').before(`
                    <div class="select__enums__item" style="margin-bottom: 4px; width: 100%; position: relative;">
                        <div class="cf-field-enum__remove" title="Удалить" style="width: auto;">
                            <svg class="svg-icon svg-common--trash-dims"><use xlink:href="#common--trash"></use></svg>
                        </div>
                        ${ input_edit_service }
                    </div>
                `);

                $('.modal__edit__serives .input__edit__service').css({ 'padding-right': '25px', 'width': '100%' });
                $('.modal__edit__serives .input__edit__service').attr('data-id', id);
                $('.cf-field-enum__remove').css({
                    'position': 'absolute',
                    'top': '10px',
                    'left': $('.modal__edit__serives .input__edit__service').outerWidth() - 20,
                    'cursor': 'pointer'
                });

                // удаление варианта
                $('.modal__edit__serives .cf-field-enum__remove').unbind('click');
                $('.modal__edit__serives .cf-field-enum__remove').bind('click', function (e) {
                    $(e.target).closest('.select__enums__item').remove();
                });
            }

            // выводим ранее сохраненные варианты
            if (services.length > 1) {
                $.each(services, function () {
                    if (this.option === 'Выберите оказанную услугу') return;
                    add_service(this.id, this.option);
                });
            } else add_service();

            // добавление варианта
            $('.modal__edit__serives .link__add__service').unbind('click');
            $('.modal__edit__serives .link__add__service').bind('click', function (e) {
                e.preventDefault();

                if (!$('.modal__edit__serives .input__edit__service').length) add_service();
                else {
                    let is_empty_input = false;

                    $.each($('.modal__edit__serives .input__edit__service'), function () {
                        if (!$(this).val().trim().length) {
                            $(this).val('').focus();
                            is_empty_input = true;
                            return false;
                        }
                    });

                    if (!is_empty_input) add_service();
                }
            });

            // кнопки Сохранить и Закрыть
            let save_services_btn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                    class_name: 'save__services__btn',
                    text: 'Сохранить'
                }),
                close_services_btn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
                    class_name: 'close__services__btn',
                    text: 'Закрыть'
                });

            $('.modal__edit__serives').append(`
                <div class="modal__body__actions__services" style="width: 100%; margin-top: 20px;">
                    ${ save_services_btn } ${ close_services_btn }
                </div>
            `);

            // отступ снизу
            marginBottom('modal__edit__serives');
            // обновление списка услуг
            updateServices();
        }

        // обновление списка услуг
        const updateServices = function () {
            let services = [];

            $('.modal__edit__serives .save__services__btn').unbind('click');
            $('.modal__edit__serives .save__services__btn').bind('click', function () {
                // удаляем текущий список услуг
                $('.modal__finish .services__wrapper').remove();

                $.each($('.modal__edit__serives .input__edit__service'), function () {
                    if (!$(this).val().trim().length) return;
                    services.push($(this).val().trim());
                });

                // обновляем список услуг в БД
                $.ajax({
                    url: url_link_t,
                    method: 'POST',
                    data: {
                        'domain': document.domain,
                        'method': 'update_services',
                        'services': services
                    },
                    dataType: 'json',
                    success: function (data) {
                        // обновляем список услуг
                        getServices();
                        // закрываем редактирование списка услуг
                        $('.modal__edit__serives__wrapper').remove();
                    },
                    timeout: 2000
                });
            });
        }

        // комментарий
        const addComment = function () {
            let comment_service = Twig({ ref: '/tmpl/controls/textarea.twig' }).render({
                name: 'comment-service',
                class_name: 'comment__service',
                placeholder: 'введите комментарий'
            });

            $('.modal__finish').append(`
                <div class="comment__wrapper" style="width: 100%; margin-top: 10px;">
                    <span style="width: 100%;">Комментарий:</span><br/>
                    ${ comment_service }
                </div>
            `);

            $('.modal__finish .comment__service').css({ 'width': '100%', 'margin-top': '3px' });
        }

        // сохранение таймера
        const timerSave = function (timer_ID) {
            $('.modal__finish .finish__save__btn').unbind('click');
            $('.modal__finish .finish__save__btn').bind('click', function () {
                let is_error = false,
                    manager_ID = $('.modal__finish .select__managers .control--select--button').attr('data-value'),
                    entity_url = null,
                    entity_ID = AMOCRM.data.current_card.id,
                    client = null,
                    service = null;

                // если обязательные поля не выбраны, красим в красный цвет
                if ($('.modal__finish .select__managers .control--select--button').text() === 'Выберите ответственного') {
                    $('.modal__finish .select__managers .control--select--button').css('border-color', '#f57d7d');
                    is_error = true;
                }

                if ($('.modal__finish .input__client__name').length) {
                    if (!$('.modal__finish .input__client__name').val().trim().length) {
                        $('.modal__finish .input__client__name').css('border-color', '#f57d7d');
                        $('.modal__finish .input__client__name').val(
                            $('.modal__finish .input__client__name').val().trim()
                        );
                        is_error = true;
                    } else client = $('.modal__finish .input__client__name').val().trim();

                } else if ($('.modal__finish .select__clients').length) {
                    if ($('.modal__finish .select__clients .control--select--button').text() === 'Выберите клиента') {
                        $('.modal__finish .select__clients .control--select--button').css('border-color', '#f57d7d');
                        is_error = true;
                    } else client = $('.modal__finish .select__clients .control--select--button').text().trim();
                }

                if ($('.modal__finish .select__services .control--select--button').text() === 'Выберите оказанную услугу') {
                    $('.modal__finish .select__services .control--select--button').css('border-color', '#f57d7d');
                    is_error = true;
                } else service = $('.modal__finish .select__services .control--select--button').text().trim();

                // возвращаем естесственные цвета в случае изменения
                $('.modal__finish .select__managers .control--select--button').unbind('click');
                $('.modal__finish .select__managers .control--select--button').bind('click', function () {
                    $('.modal__finish .select__managers .control--select--button').css('border-color', '#d4d5d8');
                });

                $('.modal__finish .select__clients .control--select--button').unbind('click');
                $('.modal__finish .select__clients .control--select--button').bind('click', function () {
                    $('.modal__finish .select__clients .control--select--button').css('border-color', '#d4d5d8');
                });

                $('.modal__finish .input__client__name').unbind('change');
                $('.modal__finish .input__client__name').bind('change', function () {
                    $('.modal__finish .input__client__name').css('border-color', '#d4d5d8');
                });

                $('.modal__finish .select__services .control--select--button').unbind('click');
                $('.modal__finish .select__services .control--select--button').bind('click', function () {
                    $('.modal__finish .select__services .control--select--button').css('border-color', '#d4d5d8');
                });

                // останавливаем кнопку в случае отсутствия обязательных значений
                if (!client) return false;
                if (!service) return false;
                if (is_error) return false;

                // анимация выполнения кнопки
                btnSpinner('.modal__finish .finish__save__btn');

                // поиск цены сотрудника в кастомных полях
                if (AMOCRM.getBaseEntity() === 'leads') entity_url = '/api/v4/leads/' + entity_ID;
                if (AMOCRM.getBaseEntity() === 'customers') entity_url = '/api/v4/customers/' + entity_ID;

                $.ajax({
                    url: entity_url,
                    method: 'GET',
                    success: function (data) {
                        if (!data.custom_fields_values) self.price_manager = 0;
                        else {
                            $.each(data.custom_fields_values, function () {
                                if (this.field_name !== $('.modal__finish .select__managers .control--select--button').text()) {
                                    return;
                                }

                                self.price_manager = this.values[0].value;
                            });
                        }

                        // преобразуем в число
                        self.price_manager = parseInt(self.price_manager) || 0;
                        // получаем настройки для поиска поля депозита
                        let deposit_title = self.getDepositTitle();

                        // сохраняем результат
                        $.ajax({
                            url: url_link_t,
                            method: 'POST',
                            data: {
                                'domain': document.domain,
                                'method': 'timer_save',
                                'essence_ID': self.essense_ID,
                                'timer_ID': timer_ID,
                                'price_manager': self.price_manager,
                                'user': $('.modal__finish .select__managers .control--select--button').text(),
                                'client': client,
                                'service': service,
                                'comment': $('.modal__finish .comment__service').val().trim(),
                                'deposit_title': deposit_title
                            },
                            dataType: 'json',
                            success: function (data) {
                                // перезапускаем таймеры в меню
                                getTimersInfo();
                            },
                            timeout: 2000
                        });

                        // пауза для эффекта сохранения
                        setTimeout(() => {
                            // очищаем таймер
                            $('.modal__finish__wrapper').remove();
                            $(`.timer__item[data-id="${ timer_ID }"]`).remove();

                            // если удален последний таймер, добавляем пустой
                            if (!$('.modal__timer .timer__time').length) addTimer();

                            // обновляем прайс сотрудника
                            self.price_manager = 0;
                        }, '1500');
                    },
                    timeout: 2000
                });
            });
        }

        /*
         *
         * ****************************************** HISTORY **********************************************************
         *
         */

        // добавление записи в историю
        const addHistoryItem = function (item) {
            let history_ID = item[0],
                history_created_at = item[9].split(' ')[0],
                history_user = item[3],
                history_price = item[7];

            $('.modal__history .deposit__wrapper').after(`
                <div class="history__details" data-id="${ history_ID }" style="
                    display: flex; flex-direction: row; justify-content: space-between;
                    width: calc(100% - 10px); border-top: 1px solid #dbdedf; 
                    border-bottom: 1px solid #dbdedf; margin-bottom: 2px; background: #fcfcfc;
                    padding: 1px 10px; cursor: pointer;">
                    <div>
                        <span class="history__created__at" style="color: #979797; font-size: 13px;">
                            ${ history_created_at }
                        </span><br/>
                        <div class="history__user">${ history_user }</div>
                    </div>
                    <div class="history__price" style="
                        display: flex; flex-direction: row; align-items: center;">
                        <div class="history__price__int">${ history_price }</div>
                        <div class="history__price__valute">&nbsp;р.</div>
                    </div>
                </div>
            `);

            // если это пополнение депозита, красим строку и убираем курсор
            if (history_user === 'Пополнение депозита') {
                $(`.history__details[data-id="${ history_ID }"]`).css({
                    'cursor': 'auto', 'background': '#c7efc2',
                    'border-top': '1px solid #c7efc2', 'border-bottom': '1px solid #c7efc2'
                });
            } else {
                // иначе просмотр истории по ID
                $(`.history__details[data-id="${ history_ID }"]`).unbind('click');
                $(`.history__details[data-id="${ history_ID }"]`).bind('click', function () {
                    historyDetails(history_ID);
                });
            }
        }

        // редактирование истории
        const editHistoryDetails = function (history_ID) {
            let title = null;

            $('.modal__details .details__edit__btn').unbind('click');
            $('.modal__details .details__edit__btn').bind('click', function () {
                // показываем кнопку сохранить
                let details_save_btn = Twig({ref: '/tmpl/controls/button.twig'}).render({
                    class_name: 'details__save__btn button-input_blue',
                    text: 'Сохранить'
                });

                $('.modal__details .details__edit__btn').css('display', 'none');
                $('.modal__details .modal__body__actions__details').append(details_save_btn);
                $('.modal__details .details__save__btn').css({ 'display': 'block', 'margin-left': '0' });

                // ответственный
                let input_user_details_item = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                    name: 'input-user-details-item', class_name: 'input__user__details__item',
                    value: '', placeholder: 'введите имя ответственного'
                });

                title = $('.modal__details .user__details__item').text().trim();
                $('.modal__details .user__details__item').text('');
                $('.modal__details .user__details__item').append(input_user_details_item);
                $('.modal__details .input__user__details__item').val(title);
                $('.modal__details .input__user__details__item').css('width', '100%');
                $(`.modal__details .title__user__details__item`).css('padding-top', '19px');

                // имя клиента
                let input_client_details_item = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                    name: 'input-client-details-item', class_name: 'input__client__details__item',
                    value: '', placeholder: 'введите имя клиента'
                });

                title = $('.modal__details .client__details__item').text().trim();
                $('.modal__details .client__details__item').text('');
                $('.modal__details .client__details__item').append(input_client_details_item);
                $('.modal__details .input__client__details__item').val(title);
                $('.modal__details .input__client__details__item').css('width', '100%');
                $(`.modal__details .title__client__details__item`).css('padding-top', '19px');

                // оказанная услуга
                let input_service_details_item = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                    name: 'input-service-details-item', class_name: 'input__service__details__item',
                    value: '', placeholder: 'введите оказанную услугу'
                });

                title = $('.modal__details .service__details__item').text().trim();
                $('.modal__details .service__details__item').text('');
                $('.modal__details .service__details__item').append(input_service_details_item);
                $('.modal__details .input__service__details__item').val(title);
                $('.modal__details .input__service__details__item').css('width', '100%');
                $(`.modal__details .title__service__details__item`).css('padding-top', '19px');

                // комментарий
                let input_comment_details_item = Twig({ ref: '/tmpl/controls/textarea.twig' }).render({
                    name: 'input-comment-details-item',
                    class_name: 'input__comment__details__item',
                    placeholder: 'введите комментарий'
                });

                title = $('.modal__details .comment__details__item').text().trim();
                $('.modal__details .comment__details__item').text('');
                $('.modal__details .comment__details__item').append(input_comment_details_item);
                $('.modal__details .input__comment__details__item').val(title);
                $('.modal__details .input__comment__details__item').css('width', '100%');
                $(`.modal__details .title__comment__details__item`).css('padding-top', '19px');

                // стоимость работы
                let input_price_details_item = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                    name: 'input-price-details-item', class_name: 'input__price__details__item',
                    value: '', placeholder: 'введите стоимость работы'
                });

                title = $('.modal__details .price__details__item').text().trim().split('р.')[0];
                $('.modal__details .price__details__item').text('');
                $('.modal__details .price__details__item').append(input_price_details_item);
                $('.modal__details .input__price__details__item').val(title);
                $('.modal__details .input__price__details__item').css('width', '100%');
                $(`.modal__details .title__price__details__item`).css('padding-top', '19px');

                // ссылка на задачу
                let input_link_task_details_item = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                    name: 'input-link-task-details-item', class_name: 'input__link__task__details__item',
                    value: '', placeholder: 'введите ссылку на задачу'
                });

                title = $('.modal__details .link__task__details__item').text().trim();
                $('.modal__details .link__task__details__item').text('');
                $('.modal__details .link__task__details__item').append(input_link_task_details_item);
                $('.modal__details .input__link__task__details__item').val(title);
                $('.modal__details .input__link__task__details__item').css('width', '100%');
                $(`.modal__details .title__link__task__details__item`).css('padding-top', '19px');

                // время работы
                title = $('.modal__details .time__work__details__item').text().trim();
                $('.time__work__details__item').text('');

                $('.modal__details .value.time__work__details__item').append(`
                    <input type="time" 
                        name="input-time-work-details-item" 
                        class="input__time__work__details__item text-input" 
                        placeholder="введите время работы"
                        value="${ title }"
                        step="2"
                    />
                `);

                $('.input__time__work__details__item').css('width', '100%');
                $('.title__time__work__details__item').css('padding-top', '19px');
                $('.modal__details .is__change__time__work').css('padding-top', '19px');

                // обновление истории
                updateHistoryDetails(history_ID);
            });
        }

        // обновление истории
        const updateHistoryDetails = function (history_ID) {
            $('.modal__details .details__save__btn').unbind('click');
            $('.modal__details .details__save__btn').bind('click', function () {
                let user = $('.modal__details .input__user__details__item'),
                    client = $('.modal__details .input__client__details__item'),
                    service = $('.modal__details .input__service__details__item'),
                    comment = $('.modal__details .input__comment__details__item'),
                    price = $('.modal__details .input__price__details__item'),
                    link_task = $('.modal__details .input__link__task__details__item'),
                    time_work = $('.modal__details .input__time__work__details__item'),
                    is_error = false,
                    entity_url = null,
                    entity_ID = AMOCRM.data.current_card.id;

                // проверка поля на пустое значение
                const isEmptyInput = function (value) {
                    if (!value.val().trim().length) {
                        value.val('').focus();
                        value.css('border-color', '#f37575');
                        is_error = true;
                    } else value.css('border-color', '#dbdedf');
                }

                // красим поля в случае ошибки
                isEmptyInput(link_task);
                isEmptyInput(price);
                isEmptyInput(service);
                isEmptyInput(client);
                isEmptyInput(user);
                isEmptyInput(time_work);

                // в случае ошибки останавливаем кнопку
                if (is_error) return false;

                // анимация выполнения кнопки
                btnSpinner('.modal__details .details__save__btn');

                // поиск цены сотрудника в кастомных полях
                if (AMOCRM.getBaseEntity() === 'leads') entity_url = '/api/v4/leads/' + entity_ID;
                if (AMOCRM.getBaseEntity() === 'customers') entity_url = '/api/v4/customers/' + entity_ID;

                $.ajax({
                    url: entity_url,
                    method: 'GET',
                    success: function (data) {
                        // если кастомные поля есть и сотрудник найден, получаем стоимость
                        self.price_manager = 0;

                        if (data.custom_fields_values) {
                            $.each(data.custom_fields_values, function () {
                                if (this.field_name !== user.val().trim()) return;
                                self.price_manager = parseInt(this.values[0].value);
                            });
                        }

                        // получаем настройки для поиска поля депозита
                        let deposit_title = self.getDepositTitle();

                        // обновляем историю
                        $.ajax({
                            url: url_link_t,
                            method: 'POST',
                            data: {
                                'domain': document.domain,
                                'method': 'update_history',
                                'history_ID': history_ID,
                                'essence_ID': self.essense_ID,
                                'user': user.val().trim(),
                                'client': client.val().trim(),
                                'service': service.val().trim(),
                                'price': price.val().trim().trim(),
                                'link_task': link_task.val().trim(),
                                'time_work': time_work.val().trim(),
                                'comment': comment.val().trim(),
                                'deposit_title': deposit_title,
                                'price_manager': self.price_manager
                            },
                            dataType: 'json',
                            success: function (data) {
                                // показываем кнопку редактировать
                                $('.modal__details .details__save__btn').remove();
                                $('.modal__details .details__edit__btn').css('display', 'block');

                                // обновляем значения истории
                                $('.modal__details .input__user__details__item').remove();
                                $('.modal__details .input__client__details__item').remove();
                                $('.modal__details .input__service__details__item').remove();
                                $('.modal__details .input__comment__details__item').remove();
                                $('.modal__details .input__price__details__item').remove();
                                $('.modal__details .input__link__task__details__item').remove();
                                $('.modal__details .input__time__work__details__item').remove();

                                $('.modal__details .user__details__item').text(data.user);
                                $('.modal__details .client__details__item').text(data.client);
                                $('.modal__details .service__details__item').text(data.service);
                                $('.modal__details .comment__details__item').text(data.comment);
                                $('.modal__details .price__details__item').text(data.price);
                                $('.modal__details .link__task__details__item').text(data.link_task);
                                $('.modal__details .time__work__details__item').text(data.time_work);
                                // прайс в истории
                                $(`.history__details[data-id="${ data.id }"] .history__price__int`).text(data.price);

                                $('.modal__details .title__user__details__item').css('padding-top', '10px');
                                $('.modal__details .title__client__details__item').css('padding-top', '10px');
                                $('.modal__details .title__service__details__item').css('padding-top', '10px');
                                $('.modal__details .title__comment__details__item').css('padding-top', '10px');
                                $('.modal__details .title__price__details__item').css('padding-top', '10px');
                                $('.modal__details .title__link__task__details__item').css('padding-top', '10px');
                                $('.modal__details .title__time__work__details__item').css('padding-top', '10px');
                                $('.modal__details .is__change__time__work').css('padding-top', '10px');

                                // если время изменено, показываем блок "(изменено)"
                                if (data.is_change_time != 0) {
                                    $('.modal__details .is__change__time__work').text('(изменено)');
                                }

                                // обновлям итого и средний расход за 30 дней
                                let IDs = [];
                                $.each($('.modal__history .history__details'), function () {
                                    if ($(this).find('.history__user').text() === 'Пополнение депозита') return;
                                    IDs.push($(this).attr('data-id'));
                                });

                                getHistoryResultsSum(IDs);
                                getHistoryConsumptionSum(IDs);

                                // обновляем значение депозита
                                getDeposit();
                            },
                            timeout: 2000
                        });

                        self.price_manager = 0;
                    },
                    timeout: 2000
                });
            });
        }

        // просмотр истории по ID
        const historyDetails = function (history_ID) {
            // модалка таймера
            new Modal({
                class_name: 'modal__details__wrapper',
                init: function ($modal_body) {
                    let $this = $(this);
                    $modal_body
                        .trigger('modal:loaded')
                        .html(`
                            <div class="modal__details" data-id="${ history_ID }" style="width: 100%; min-height: 550px;">
                                <h2 class="modal-body__caption__details head_2" style="margin-bottom: 20px;">
                                    Детализация
                                </h2>
                            </div>
                        `)
                        .trigger('modal:centrify')
                        .append('');
                },
                destroy: function () {}
            });

            // поиск таймера по ID
            $.ajax({
                url: url_link_t,
                method: 'post',
                data: {
                    'domain': document.domain,
                    'method': 'get_timer',
                    'history_ID': history_ID
                },
                dataType: 'json',
                success: function (data) {
                    let rights = getRights();

                    // добавляем элементы истории
                    const addHistoryItem = function (title, value, class_item = '') {
                        $('.modal__details').append(`
                            <div class="details_flex" style="
                                display: flex; flex-direction: row; background: #fcfcfc; border-top: 1px solid #dbdedf;
                                border-bottom: 1px solid #dbdedf; margin-bottom: 2px;">
                                <div class="title title__${ class_item }" style="
                                    width: 200px; text-align: right; padding: 10px; color: #92989b;">
                                    ${ title }
                                </div>
                                <div class="value ${ class_item }" style="
                                    width: 100%; padding: 10px 10px 10px 0; word-wrap: break-word; max-width: 280px;">
                                    ${ value }
                                </div>
                            </div>
                        `);
                    }

                    addHistoryItem('Дата таймера', data.created_at.split(' ')[0] + 'г.');
                    addHistoryItem('Ответственный', data.user, 'user__details__item');
                    addHistoryItem('Имя клиента', data.client, 'client__details__item');
                    addHistoryItem('Оказанная услуга', data.service, 'service__details__item');
                    addHistoryItem('Комментарий', data.comment, 'comment__details__item');
                    addHistoryItem('Стоимость работы', data.price + 'р.', 'price__details__item');
                    addHistoryItem(
                        'Ссылка на задачу',
                        `
                            <a href="${ data.link_task }" target="_blank" style="
                                text-decoration: none; color: #1375ab; word-break: break-all;">
                                ${ data.link_task }
                            </a>
                        `,
                        'link__task__details__item'
                    );
                    addHistoryItem('Время работы', data.time_work, 'time__work__details__item');

                    $('.modal__details .value.time__work__details__item').css('width', '50%');
                    $('.modal__details .value.time__work__details__item').after(`
                        <div class="is__change__time__work" style="
                            width: calc(50% - 30px); padding: 10px; text-align: right; color: #92989b;">
                        </div>
                    `);

                    // если время изменено, показываем блок "(изменено)"
                    if (data.is_change_time != 0) $('.modal__details .is__change__time__work').text('(изменено)');

                    // права на редактирование истории
                    if (rights && rights.includes('is_edit_history')) {
                        // кнопка редактировать
                        let details_edit_btn = Twig({ref: '/tmpl/controls/button.twig'}).render({
                            class_name: 'details__edit__btn',
                            text: 'Редактировать'
                        });

                        $('.modal__details').append(`
                            <div class="modal__body__actions__details" style="width: 100%;">
                                ${ details_edit_btn }
                            </div>
                        `);

                        $('.modal__details .modal__body__actions__details').css('margin-top', '10px');

                        // редактирование истории
                        editHistoryDetails(data.id);
                        // отступ снизу
                        marginBottom('modal__details');
                    }
                },
                timeout: 2000
            });

            // кнопка закрыть
            let details_close_btn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
                class_name: 'details__close__btn',
                text: 'Закрыть'
            });

            $('.modal__details').append(`
                <div class="details__close" style="position: absolute; right: 20px; top: 27px;">
                    ${ details_close_btn }
                </div>
            `);
        }

        // получаем историю
        const getHistory = function () {
            $.ajax({
                url: url_link_t,
                method: 'POST',
                data: {
                    'domain': document.domain,
                    'method': 'get_history',
                    'essence_ID': self.essense_ID
                },
                dataType: 'json',
                success: function (data) {
                    if (!data.length) {
                        $('.modal__history').append(`
                            <div class="history__no__results" style="
                                width: 100%; text-align: center; padding: 30px 0 10px;">
                                Таймеров не найдено
                            </div>
                        `);
                    } else {
                        $.each(data, function () { addHistoryItem(this) });

                        // итоговая сумма истории и средний расход по списанию
                        $('.modal__history').append(`
                            <div class="itogo" style="padding-bottom: 30px;
                                font-style: italic; margin-top: 15px; display: flex; flex-direction: column;">
                                <div class="results__sum__title" style=" 
                                    width: 100%; display: flex; flex-direction: row; justify-content: right;">
                                    Итого:&nbsp;
                                    <div class="results__sum__int">0</div>
                                    <div class="results__sum__valute">&nbsp;р.</div>
                                </div>
                                <div class="consumption__sum__title" style="
                                    width: 100%; display: flex; flex-direction: row; justify-content: right;">
                                    Средний расход за последние 30 дней:&nbsp;
                                    <div class="consumption__sum__int">0</div>
                                    <div class="consumption__sum__valute">&nbsp;р.</div>
                                </div>
                            </div>
                        `);

                        // обновлям итого и средний расход за 30 дней
                        let IDs = [];
                        $.each(data, function () {
                            if (this[3] === 'Пополнение депозита') return;
                            IDs.push(this[0]);
                        });

                        getHistoryResultsSum(IDs);
                        getHistoryConsumptionSum(IDs);
                    }
                },
                timeout: 2000
            });
        }

        // итого
        const getHistoryResultsSum = function (IDs) {
            $.ajax({
                url: url_link_t,
                method: 'POST',
                data: {
                    'domain': document.domain,
                    'method': 'get_history_results_sum',
                    'IDs': IDs
                },
                dataType: 'json',
                success: function (data) {
                    $('.modal__history .itogo .results__sum__int').text(data);
                },
                timeout: 2000
            });
        }

        // средний расход за 30 дней
        const getHistoryConsumptionSum = function (IDs) {
            $.ajax({
                url: url_link_t,
                method: 'POST',
                data: {
                    'domain': document.domain,
                    'method': 'get_history_consumption_sum',
                    'IDs': IDs
                },
                dataType: 'json',
                success: function (data) {
                    $('.modal__history .itogo .consumption__sum__int').text(data);
                },
                timeout: 2000
            });
        }

        // получаем депозит
        const getDeposit = function () {
            $.ajax({
                url: url_link_t,
                method: 'POST',
                data: {
                    'domain': document.domain,
                    'method': 'get_deposit',
                    'essence_ID': self.essense_ID
                },
                dataType: 'json',
                success: function (data) { $('.deposit__wrapper .deposit .deposit__sum__int').text(data) },
                timeout: 2000
            });
        }

        // добавление депозита
        const addDeposit = function () {
            new Modal({
                class_name: 'modal__edit__deposit__wrapper',
                init: function ($modal_body) {
                    let $this = $(this);
                    $modal_body
                        .trigger('modal:loaded')
                        .html(`
                            <div class="modal__edit__deposit" style="width: 100%; height: 125px;">
                                <h2 class="modal__body__caption head_2">Пополнение депозита</h2>
                            </div>
                        `)
                        .trigger('modal:centrify')
                        .append('');
                },
                destroy: function () {}
            });

            // поле ввода депозита
            let input_deposit = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                name: 'input-deposit',
                class_name: 'input__deposit',
                placeholder: 'укажите сумму депозита'
            });

            $('.modal__edit__deposit').append(input_deposit);
            $('.modal__edit__deposit .input__deposit').css({ 'width': '100%', 'margin-top': '10px' });
            $('.modal__edit__deposit .input__deposit').attr('type', 'number');
            $('.modal__edit__deposit .input__deposit').focus();

            // кнопки сохранить и закрыть
            let deposit_save_btn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                    class_name: 'deposit__save__btn button-input_blue',
                    text: 'Пополнить'
                }),
                deposit_cancel_btn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
                    class_name: 'deposit__cancel__btn',
                    text: 'Закрыть'
                });

            $('.modal__edit__deposit').append(`
                <div class="modal__body__actions__edit__deposit" style="width: 100%; margin-top: 20px;">
                    ${ deposit_save_btn } ${ deposit_cancel_btn }
                </div>
            `);

            // сохранение депозита
            saveDeposit();
        }

        // сохранение депозита
        const saveDeposit = function () {
            $('.modal__edit__deposit .deposit__save__btn').unbind('click');
            $('.modal__edit__deposit .deposit__save__btn').bind('click', function () {
                if (!$('.modal__edit__deposit .input__deposit').val().trim().length) {
                    $('.modal__edit__deposit .input__deposit').css('border-color', '#f57d7d');
                    $('.modal__edit__deposit .input__deposit').focus();
                    return false;
                }

                // анимация выполнения кнопки
                btnSpinner('.modal__edit__deposit .deposit__save__btn');

                // получаем настройки для поиска поля депозита
                let deposit_title = self.getDepositTitle(),
                    deposit = parseInt($('.deposit__wrapper .deposit .deposit__sum__int').text().trim()),
                    input_deposit = parseInt($('.modal__edit__deposit .input__deposit').val().trim());

                deposit += input_deposit;

                if (input_deposit === 0) $('.modal__edit__deposit__wrapper').remove();
                else {
                    // обновляем депозит
                    $.ajax({
                        url: url_link_t,
                        method: 'POST',
                        data: {
                            'domain': document.domain,
                            'method': 'update_deposit',
                            'essence_ID': self.essense_ID,
                            'user_ID': AMOCRM.constant('user').id,
                            'deposit': deposit,
                            'price': input_deposit,
                            'deposit_title': deposit_title,
                            'timezone': AMOCRM.constant('account').timezone
                        },
                        dataType: 'json',
                        success: function (data) {
                            // добавляем пополнение депозита в историю
                            addHistoryItem(data);
                            // обновляем значение депозита
                            getDeposit();
                            // закрываем окно
                            $('.modal__edit__deposit__wrapper').remove();
                        },
                        timeout: 2000
                    });
                }

            });
        }

        // фильтр поиска
        const historyFilter = function () {
            $('.modal__history .link__filter').unbind('click');
            $('.modal__history .link__filter').bind('click', function (e) {
                e.preventDefault();

                // модалка фильтра
                new Modal({
                    class_name: 'modal__filter__wrapper',
                    init: function ($modal_body) {
                        let $this = $(this);
                        $modal_body
                            .trigger('modal:loaded')
                            .html(`
                                <div class="modal__filter" style="width: 100%; height: 160px;">
                                    <h2 class="modal__body__caption__filter head_2">Фильтр поиска</h2>
                                </div>
                            `)
                            .trigger('modal:centrify')
                            .append('');
                    },
                    destroy: function () {}
                });

                // даты от - до
                let input_filter_from = Twig({ ref: '/tmpl/controls/date_field.twig' }).render({
                        input_class: 'input__filter__from',
                        value: '',
                        placeholder: 'введите значение от:'
                    }),
                    input_filter_to = Twig({ ref: '/tmpl/controls/date_field.twig' }).render({
                        input_class: 'input__filter__to',
                        value: '',
                        placeholder: 'введите значение до:'
                    });

                $('.modal__filter').append(`
                    <div class="input__filter__wrapper" style="width: 100%; margin-top: 20px;">
                        <span style="width: 100%;">Введите дату поиска (от - до):</span><br/>
                        <div class="input__filter__flex" style="
                            display: flex; flex-direction: row; width: 100%; margin-top: 3px;">
                            <div class="date_from">${ input_filter_from }</div>
                            <div style="padding: 8px 10px 0; color: #dbdedf;">-</div>
                            <div class="date_to">${ input_filter_to }</div>
                        </div>
                    </div>
                `);

                // кнопки Показать, Закрыть
                let filter_save_btn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                        class_name: 'filter__save__btn',
                        text: 'Показать'
                    }),
                    filter_cancel_btn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
                        class_name: 'filter__cancel__btn',
                        text: 'Закрыть'
                    });

                $('.modal__filter').append(`
                    <div class="modal__body__actions__filter" style="width: 100%; margin-top: 20px;">
                        ${ filter_save_btn } ${ filter_cancel_btn }
                    </div>
                `);

                // интервал истории по фильтру
                getHistoryFilter();
            });
        }

        // поиск истории по фильтру
        const getHistoryFilter = function () {
            $('.modal__filter .filter__save__btn').unbind('click');
            $('.modal__filter .filter__save__btn').bind('click', function () {
                let filter_from = $('.modal__filter .input__filter__from'),
                    filter_to = $('.modal__filter .input__filter__to'),
                    isErrorFilter = false;

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

                // поиск таймеров по фильтру
                $.ajax({
                    url: url_link_t,
                    method: 'POST',
                    data: {
                        'domain': document.domain,
                        'method': 'get_history_filter',
                        'essence_ID': self.essense_ID,
                        'filter_from': filter_from.val().trim(),
                        'filter_to': filter_to.val().trim(),
                    },
                    dataType: 'json',
                    success: function (data) {
                        let IDs = [];

                        // очищаем прежний вывод
                        if ($('.modal__history .history__details').length) $('.modal__history .history__details').remove();
                        if ($('.modal__history .history__no__results').length) $('.modal__history .history__no__results').remove();
                        if ($('.modal__history .filter__title').length) $('.modal__history .filter__title').remove();
                        $('.modal__history .itogo .consumption__sum__title').css('display', 'none');

                        if (!data || !data.length) {
                            $('.modal__history .deposit__wrapper').after(`
                                <div class="history__no__results" style="
                                    width: 100%; text-align: center; padding: 30px 0 10px;">
                                    Таймеров не найдено
                                </div>
                            `);
                        } else {
                            $.each(data, function () {
                                // добавляем таймер
                                addHistoryItem(this)

                                // обновлям итого и средний расход за 30 дней
                                if (this[3] === 'Пополнение депозита') return;
                                IDs.push(this[0]);
                            });
                        }

                        // обновлям итого и средний расход за 30 дней
                        getHistoryResultsSum(IDs);
                        getHistoryConsumptionSum(IDs);

                        // добавляем надпись фильтра дат
                        $('.modal__history .deposit__wrapper').after(`
                            <div class="filter__title" style="
                                width: 100%; margin-bottom: 3px; color: #92989b; font-size: 14px;">
                                Фильтр таймеров с ${ filter_from.val() }г. по ${ filter_to.val() }г.:
                            </div>
                        `);

                        // закрываем окно
                        $('.modal__filter__wrapper').remove();
                    },
                    timeout: 2000
                });
            });
        }

        // история таймеров
        const timerHistory = function (e) {
            e.preventDefault();

            // права доступа
            let rights = null;
            rights = getRights();

            // запуск модалки истории
            new Modal({
                class_name: 'modal__history__wrapper',
                init: function ($modal_body) {
                    let $this = $(this);
                    $modal_body
                        .trigger('modal:loaded')
                        .html(`
                            <div class="modal__history" style="width: 100%; height: 600px;">
                                <h2 class="modal__body__caption head_2">История таймеров</h2>
                            </div>
                        `)
                        .trigger('modal:centrify')
                        .append('');
                },
                destroy: function () {}
            });

            $('.modal__history__wrapper .modal-body').css('overflow', 'auto');
            $('.modal__history').css('position', 'relative');

            // сумма депозита
            $('.modal__history').append(`
                <div class="deposit__wrapper" style="width: 100%; margin-top: 20px;">
                    <div class="deposit__wrapper__flex" style="display: flex; flex-direction: row;">
                        <div class="deposit" style="width: 80%; display: flex; flex-direction: row;">
                            <span>Сумма депозита:</span>
                            <div class="deposit__sum" style="margin-top: 8px;">
                                <span class="deposit__sum__int">0</span>&nbsp;р.
                            </div>
                        </div>
                        <div class="filter" style="width: 20%; text-align: right; padding-top: 7px;">
                            <a href="" class="link__filter" style="
                                text-decoration: none; color: #1375ab; word-break: break-all;">
                                Фильтр
                            </a>
                        </div>
                    </div>
                </div>
            `);

            $('.deposit__wrapper .deposit span').css('margin-top', '8px');
            $('.deposit__wrapper .deposit div').css('margin-left', '5px');
            $('.deposit__wrapper .deposit__wrapper__flex').css('margin-bottom', '10px');

            // обновляем значение депозита
            getDeposit();

            // кнопка добавления депозита
            if (rights && rights.includes('is_edit_deposit')) {
                $('.deposit__wrapper .deposit').append(`
                    <div class="deposit__btn__wrapper">
                        <button type="button" class="button-input add__deposit__btn">
                            <span class="button-input-inner">
                                <span class="button-input-inner__text">+</span>
                            </span>
                        </button>
                    </div>
                `);

                $('.deposit__wrapper .deposit__btn__wrapper').css('margin-left', '10px');
                $('.deposit__wrapper .add__deposit__btn').css('padding', '10px 12px 8px');
                $('.deposit__wrapper .add__deposit__btn .button-input-inner__text').css({
                    'font-size': '18px', 'font-weight': 'normal'
                });

                // добавление депозита
                $('.deposit__wrapper .add__deposit__btn').unbind('click');
                $('.deposit__wrapper .add__deposit__btn').bind('click', addDeposit);
            }

            // фильтр поиска
            historyFilter();

            // ссылка экспорта и кнопка закрыть
            let history_close_btn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
                class_name: 'history__close__btn',
                text: 'Закрыть'
            });

            $('.modal__history').append(`
                <div class="right__title" style="
                    height: 25px; position: absolute; right: 0; top: 0; margin-top: 5px; 
                    display: flex; flex-direction: row; padding-top: -3px;">
                    <div class="right__export" style="
                        padding-right: 12px; border-right: 1px solid #dbdedf;">
                        <a href="" class="export__link" style="text-decoration: none; color: #1375ab;">
                            Экспорт
                        </a>
                    </div>
                    <div class="right__close" style="padding-left: 5px; margin-top: -4px;">
                        ${ history_close_btn }
                    </div>
                </div>
            `);

            // кнопка закрыть
            $('.modal__history .hystory__cancel__btn').unbind('click');
            $('.modal__history .hystory__cancel__btn').bind('click', function (e) {
                e.preventDefault();
                $('.modal__history').remove();
            });

            // экспорт таймеров
            $('.modal__history .export__link').unbind('click');
            $('.modal__history .export__link').bind('click', function (e) {
                e.preventDefault();
                let IDs = [];

                $.each($('.modal__history .history__details'), function () {
                    IDs.push($(this).attr('data-id'));
                });

                exportTimers(IDs);
            });

            // получаем историю
            getHistory();
        }

        /*
         *
         * ****************************************** START TIMER ******************************************************
         *
         */

        // модалка таймера
        const modalTimer = function () {
            // нажатие на ссылку таймера
            $('.billing__link').unbind('click');
            $('.billing__link').bind('click', function (e) {
                e.preventDefault();

                let interval, services = [], rights = null;

                self.getConfigSettings(); // получение настроек
                self.essense_ID = AMOCRM.data.current_card.id; // ущность
                self.user_ID = AMOCRM.constant('user').id; // ID пользователя

                // права на текущего пользователя
                rights = getRights();

                self.clearIntervals(); // очищаем интервалы
                getTimersInfo(); // перезапускаем таймеры в меню
                timerOpen(); // запуск модалки таймера

                // ссылка истории и кнопка закрыть
                let timer_close_btn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
                    class_name: 'timer__close__btn',
                    text: 'Закрыть'
                });

                $('.modal__timer').append(`
                    <div class="right__title" style="
                        position: absolute; right: 23px; margin-top: -20px; display: flex; flex-direction: row;">
                        <div class="right__history" style="
                            padding-right: 12px; border-right: 1px solid #dbdedf; display: none;">
                            <a href="" class="hystory__link" style="text-decoration: none; color: #1375ab;">История</a>
                        </div>
                        <div class="right__close" style="margin-top: -7px; padding-left: 5px; padding-top: 3px;">
                            ${ timer_close_btn }
                        </div>
                    </div>
                `);

                if (rights && rights.includes('is_show_history')) {
                    $('.modal__timer__wrapper .right__history').css('display', 'block');
                }

                // история таймеров
                $('.modal__timer .hystory__link').unbind('click');
                $('.modal__timer .hystory__link').bind('click', timerHistory);

                /* ************************************************************** */

                addLinkProject(rights); // ссылка на проект
                linkAddTimer(); // ссылка на добавление таймера
                getTimers(); // отображение запущенных таймеров, или нового
            });
        }

        /*
         *
         * ****************************************** SETTINGS *********************************************************
         *
         */

        const accessRight = function () {
            self.getConfigSettings();

            // покупатели
            $('.widget_settings_block__controls').before(`
                <div class="widget_settings_block__item_field customers__wrapper" style="margin-top: 10px;"></div>
            `);

            // список полей покупателей
            const getCustomers = function (url) {
                let customers = [];
                customers.push({ option: 'Выберите поле' });

                $.ajax({
                    url: url,
                    success: function (data) {
                        $.each(data._embedded.custom_fields, function () {
                            customers.push({ id: this.id, option: this.name });
                        });

                        if (data._links.next) getCustomers(data._links.next.href);
                        else {
                            let select_customers = Twig({ ref: '/tmpl/controls/select.twig' }).render({
                                items: customers,
                                class_name: 'select__customers'
                            });

                            $('.widget_settings_block__item_field.customers__wrapper').append(`
                                <div class="widget_settings_block__title_field" title="" style="margin-bottom: 3px;">
                                    Настройка поля для депозита:
                                </div>
                                <div class="widget_settings_block__input_field" style="width: 100%;">
                                    ${ select_customers }
                                </div>
                            `);

                            $('.customers__wrapper .select__customers .control--select--button').css('width', '100%');
                            $('.customers__wrapper .select__customers ul').css({
                                'margin-left': '13px',
                                'width': '100%',
                                'min-width': $('.customers__wrapper').outerWidth() - 13
                            });

                            // если ранее значение было, отмечаем
                            if (self.config_settings.deposit_title && self.config_settings.deposit_title.length) {
                                $.each($('.customers__wrapper ul li'), function () {
                                    if ($(this).hasClass('control--select--list--item-selected')) {
                                        $(this).removeClass('control--select--list--item-selected');
                                    }

                                    if ($(this).find('span').text().trim() === self.config_settings.deposit_title) {
                                        $(this).addClass('control--select--list--item-selected');
                                        $('.control--select--button-inner').text(self.config_settings.deposit_title);
                                    }
                                });
                            }

                            // обновляем права пользователя
                            $('.customers__wrapper .select__customers ul li').unbind('click');
                            $('.customers__wrapper .select__customers ul li').bind('click', function () {
                                if (!self.config_settings.deposit_title) self.config_settings.deposit_title = '';

                                let deposit_title = $(this).find('span').text().trim();
                                if (deposit_title === 'Выберите поле') deposit_title = '';

                                self.config_settings.deposit_title = deposit_title;
                                self.saveConfigSettings();
                            });
                        }
                    },
                    timeout: 5000
                });
            }

            getCustomers('/api/v4/customers/custom_fields?limit=50');

            // список активных пользователей
            let managers = [], checkbox;
            managers.push({ option: 'Выберите пользователя' });

            $.each(AMOCRM.constant('managers'), function () {
                if (!this.active) return;
                managers.push({ id: this.id, option: this.title });
            });

            let select_managers = Twig({ ref: '/tmpl/controls/select.twig' }).render({
                items: managers,
                class_name: 'select__managers'
            });

            $('.widget_settings_block__controls').before(`
                <div class="widget_settings_block__item_field managers__wrapper" style="margin-top: 10px;">
                    <div class="widget_settings_block__title_field" title="" style="margin-bottom: 3px;">
                        Настройка прав пользователей:
                    </div>
                    <div class="widget_settings_block__input_field" style="width: 100%;">
                        ${ select_managers }
                    </div>
                </div>
            `);

            $('.managers__wrapper .select__managers .control--select--button').css('width', '100%');
            $('.managers__wrapper .select__managers ul').css({
                'margin-left': '13px',
                'width': '100%',
                'min-width': $('.managers__wrapper').outerWidth() - 13
            });

            // выбор пользователя
            $('.managers__wrapper .select__managers ul li').unbind('click');
            $('.managers__wrapper .select__managers ul li').bind('click', function () {
                let manager_ID = $(this).attr('data-value');

                // очищаем перед запуском чекбоксы
                $('.rights__wrapper').remove();
                if ($(this).find('span').text() === 'Выберите пользователя') return;

                // ддобавление чекбокса
                const addRightsCheckox = function (value, data_value) {
                    let rights_checkox = Twig({ ref: '/tmpl/controls/checkbox.twig' }).render({
                        class_name: 'rights__checkox',
                        checked: false,
                        value: value,
                        input_class_name: 'rights__checkox__item',
                        name: 'rights-checkox',
                        text: value,
                        dataValue: data_value
                    });

                    return rights_checkox;
                }

                $('.widget_settings_block__controls').before(`
                    <div class="rights__wrapper" style="width: 100%; margin-top: 10px;"></div>
                `);

                // ссылка в сущности
                $('.rights__wrapper').append(addRightsCheckox('Редактирование ссылки в сущности', 'is_edit_link'));
                // редактировать список услуг
                $('.rights__wrapper').append(addRightsCheckox('Редактирование списка в форме на выбор услуги', 'is_edit_services'));
                // просмотр истории
                $('.rights__wrapper').append(addRightsCheckox('Просмотр истории выполненных задач в сущности', 'is_show_history'));
                // редактирование истории
                $('.rights__wrapper').append(addRightsCheckox('Редактирование истории', 'is_edit_history'));
                // редактирование депозита
                $('.rights__wrapper').append(addRightsCheckox('Редактирование депозита', 'is_edit_deposit'));

                // выравниваем чекбоксы
                $('.rights__wrapper .rights__checkox').css({ 'width': '100%', 'margin-top': '3px' });

                // если ранее были отмечены, отображаем
                if (self.config_settings.rights) {
                    $.each(self.config_settings.rights, function (key, value) {
                        if (key !== manager_ID) return;
                        let rights = self.config_settings.rights[manager_ID];

                        $.each($('.rights__wrapper .rights__checkox'), function () {
                            let value = $(this).find('.rights__checkox__item').attr('data-value');

                            if (rights.includes(value)) {
                                $(this).addClass('is-checked');
                                $(this).trigger('click');
                            }
                        });
                    });
                }

                // обновляем права пользователя
                $('.rights__wrapper .rights__checkox').unbind('change');
                $('.rights__wrapper .rights__checkox').bind('change', function () {
                    // если ранее не был отмечен, создаем
                    if (!self.config_settings.rights) self.config_settings.rights = {};
                    let rights = [];

                    // обновляем список выбранных вариантов
                    $.each($('.rights__wrapper .rights__checkox'), function () {
                        if ($(this).hasClass('is-checked')) rights.push(
                            $(this).find('.rights__checkox__item').attr('data-value')
                        );
                    });

                    self.config_settings.rights[manager_ID] = rights;
                    self.saveConfigSettings();
                });
            });
        }

        /*
         *
         * ****************************************** ADVANCED SETTINGS ************************************************
         *
         */

        // меню событий фильтра
        const menuFilter = function () {
            $('.settings__search__filter').append(`
                <div class="js-filter-sidebar filter-search visible" id="sidebar" style="width: calc(100% - 54px); position: absolute; z-index: 2;">
                    <div class="filter-search__wrapper custom-scroll">
                        <div class="filter-search__inner">

                        <div class="filter-search__left">
                            <ul class="filter-search__list js-filter-list" id="filter_list">

                                <li class="filter__list__item filter__list__item-system-preset js-filter__common_settings__item-sortable js-filter-preset-link" title="Все события">
                                    <span class="filter_items__handle"><span class="icon icon-v-dots"></span></span>
                                    <a href="" class="js-navigate-link filter__list__item__link filter__all__events">
                                        <span class="filter__list__item__inner">Все события</span>
                                    </a>
                                </li>

                                <li class="filter__list__item filter__list__item-system-preset js-filter__common_settings__item-sortable js-filter-preset-link" title="Мои события">
                                    <span class="filter_items__handle"><span class="icon icon-v-dots"></span></span>
                                    <a href="" class="js-navigate-link filter__list__item__link filter__my__events">
                                        <span class="filter__list__item__inner">Мои события</span>
                                    </a>
                                </li>

                                <li class="filter__list__item filter__list__item-system-preset js-filter__common_settings__item-sortable js-filter-preset-link" title="События за сегодня">
                                    <span class="filter_items__handle"><span class="icon icon-v-dots"></span></span>
                                    <a href="" class="js-navigate-link filter__list__item__link filter__today__events">
                                        <span class="filter__list__item__inner">События за сегодня</span>
                                    </a>
                                </li>

                                <li class="filter__list__item filter__list__item-system-preset js-filter__common_settings__item-sortable js-filter-preset-link " title="События за вчера">
                                    <span class="filter_items__handle"><span class="icon icon-v-dots"></span></span>
                                    <a href="" class="js-navigate-link filter__list__item__link filter__yesterday__events">
                                        <span class="filter__list__item__inner">События за вчера</span>
                                    </a>
                                </li>

                                <li class="filter__list__item filter__list__item-system-preset js-filter__common_settings__item-sortable js-filter-preset-link " title="События за месяц">
                                    <span class="filter_items__handle"><span class="icon icon-v-dots"></span></span>
                                    <a href="" class="js-navigate-link filter__list__item__link filter__month__events">
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

                                            <!-- календарь событий -->
                                            <div class="filter__custom_settings__item date__filter" data-tmpl="text">
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
                                                    <b class="js-filter-field-clear clear__date"></b>
                                                </div>
                                            </div>

                                            <!-- список менеджеров -->
                                            <div class="filter-search__users-select-holder filter-search__users-select-holder_ filter__custom_settings__item filter__custom_settings__item_suggest-manager" data-title="Менеджеры" data-is-fn="usersSelectClear" data-type="" data-tmpl="users" data-element-type-name="" data-input-name="filter[main_user][]">
                                                <div class="custom-scroll">
                                                    <div class="multisuggest users_select-select_one  js-multisuggest js-can-add " data-multisuggest-id="5834" id="filter_users_select__holder" data-new-item-msg="">
                                                        <ul class="multisuggest__list js-multisuggest-list"></ul>
                                                    </div>
                                                </div>
                                                <b class="js-filter-field-clear clear__managers"></b>
                                            </div>

                                            <div class="filter__managers" style="width: 100%; position: relative; margin: 3px 0 0 3px;"></div>

                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        </div>
                    </div>
                </div>
            `);
        }

        // закрытие фильтра
        const filterClose = function () {
            // если нет сохраненной даты, удаляем фильтр даты
            if (!self.filter_date) {
                if ($('.list-top-search .date__filter__icon')) {
                    $('.list-top-search .date__filter__icon').remove();
                }
            }

            // если нет сохраненных менеджеров, удаляем фильтр менеджеров
            if (!self.filter_managers.length) {
                if ($('.list-top-search .managers__filter__icon')) {
                    $('.list-top-search .managers__filter__icon').remove();
                }
            }

            // удаляем окно фильтра
            $('.settings__search__filter .js-filter-sidebar.filter-search').remove();
        }

        // кнопка сбросить
        const clearBtn = function () {
            // удаляем ранее выбранные фильтры и прячем кнопки фильтра
            if ($('.list-top-search .search-options').length) $('.list-top-search .search-options').remove();

            if (!$('.list-top-search .list-top-search__apply-block').hasClass('h-hidden')) {
                $('.list-top-search .list-top-search__apply-block').addClass('h-hidden');
            }

            if (!$('#search_clear_button').hasClass('h-hidden')) {
                $('#search_clear_button').addClass('h-hidden');
            }

            // удаляем кнопки Применить и Сбросить
            if ($('#search-suggest-drop-down-menu')) $('#search-suggest-drop-down-menu').remove();
            if ($('.js-filter-sidebar.filter-search .modal-body__actions')) {
                $('.js-filter-sidebar.filter-search .modal-body__actions').remove();
            }

            // удаляем рамки заголовков даты и менеджеров
            if ($('.filter-search__right .filter__custom_settings__item.date__filter').hasClass('glow')) {
                $('.filter-search__right .filter__custom_settings__item.date__filter').removeClass('glow');
            }

            if ($('.filter-search__right .filter-search__users-select-holder').hasClass('glow')) {
                $('.filter-search__right .filter-search__users-select-holder').removeClass('glow');
            }

            // обнуляем значения фильтра
            self.filter_date = null;
            self.filter_managers = [];

            // удаляем окно фильтра
            $('.settings__search__filter .js-filter-sidebar.filter-search').remove();
            // очищаем результат количества событий
            $('.list-top-search .list-top-search__summary-text').text('0 событий');

            // удаляем старый результат
            if ($('.list__table__holder').length) $('.list__table__holder').remove();

            return false;
        }

        // обработка параметров фильтра
        const getParamsFilter = function () {
            let result = {},
                filter_date,
                date_from, date_to, dt = null,
                date_start = null, date_end = null,
                filter_managers = [];

            // если дата не выбрана, пишем пустое значение
            if (!self.filter_date) result.filter_date = null;
            // иначе разбираем дату
            else {
                filter_date = self.filter_date.split('(')[0].trim();

                // убираем лишние пробелы
                filter_date = self.filter_date.replace(/\s{2,}/g, ' ');

                // если дата в скобках - убираем скобки
                if (filter_date.slice(0, 1) === '(') {
                    filter_date = filter_date.slice(1, -1);
                }

                // за сегодня
                if (filter_date.indexOf('За сегодня') !== -1) {
                    date_from = date_to = new Date().toLocaleDateString();

                    // за вчера
                } else if (filter_date.indexOf('За вчера') !== -1) {
                    dt = new Date();
                    dt = dt.setDate(dt.getDate() - 1);

                    date_from = date_to = new Date(dt).toLocaleDateString();

                    // за последние Х дней
                } else if (filter_date.indexOf('За последние') !== -1) {
                    filter_date = filter_date.split(' ')[2];

                    dt = new Date();
                    dt = dt.setDate(dt.getDate() - parseInt(filter_date));

                    date_from = new Date(dt).toLocaleDateString();
                    date_to = new Date().toLocaleDateString();

                    // за эту неделю
                } else if (filter_date.indexOf('За эту неделю') !== -1) {
                    dt = new Date().getDay();
                    date_from = new Date().getDate() - dt + (dt === 0 ? -6 : 1);
                    date_from = new Date(new Date().setDate(date_from)).toLocaleDateString();

                    dt = new Date();
                    date_to = dt.setDate(dt.getDate() + (7 - dt.getDay()));
                    date_to = new Date(date_to).toLocaleDateString();

                    // за прошлую неделю
                } else if (filter_date.indexOf('За прошлую неделю') !== -1) {
                    dt = new Date().getDay();
                    date_from = new Date().getDate() - dt + (dt === 0 ? -6 : 1);
                    date_from = new Date(new Date().setDate(date_from - 7)).toLocaleDateString();

                    dt = new Date();
                    date_to = dt.setDate(dt.getDate() + (7 - dt.getDay()) - 7);
                    date_to = new Date(date_to).toLocaleDateString();

                    // за этот месяц
                } else if (filter_date.indexOf('За этот месяц') !== -1) {
                    dt = new Date();

                    date_from = new Date(dt.getFullYear(), dt.getMonth(), 1).toLocaleDateString();
                    date_to = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).toLocaleDateString();

                    // за прошлый месяц
                } else if (filter_date.indexOf('За прошлый месяц') !== -1) {
                    // первое число прошлого месяца
                    dt = new Date();
                    dt = new Date(dt.getFullYear(), dt.getMonth() - 1, 1);

                    date_from = new Date(dt.getFullYear(), dt.getMonth(), 1).toLocaleDateString();
                    date_to = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).toLocaleDateString();

                    // за квартал
                } else if (filter_date.indexOf('За квартал') !== -1) {
                    // определяем текущий квартал
                    dt = new Date();

                    if (dt.getMonth() < 3) dt = new Date(dt.getFullYear(), 0, 1);
                    if (dt.getMonth() > 2 && dt.getMonth() < 6) dt = new Date(dt.getFullYear(), 3, 1);
                    if (dt.getMonth() > 5 && dt.getMonth() < 9) dt = new Date(dt.getFullYear(), 6, 1);
                    if (dt.getMonth() > 8) dt = new Date(dt.getFullYear(), 9, 1);

                    date_from = new Date(dt.getFullYear(), dt.getMonth(), 1).toLocaleDateString();
                    date_to = new Date(dt.getFullYear(), dt.getMonth() + 3, 0).toLocaleDateString();

                    // за этот год
                } else if (filter_date.indexOf('За этот год') !== -1) {
                    dt = new Date();
                    date_from = new Date(dt.getFullYear(), 0, 1).toLocaleDateString();
                    date_to = new Date(dt.getFullYear(), 12, 0).toLocaleDateString();

                    // иначе обнуляем дату
                } else date_from = date_to = null;

                // если выбор не из списка, значит вручную (от и до)
                if (!(date_from && date_to)) {
                    date_start = filter_date.split('-')[0];
                    date_end = filter_date.split('-')[1];

                    // если есть начальное и конечное значение, преобразуем в дату
                    if (date_start && date_end) {
                        date_start = date_start.trim();
                        date_end = date_end.trim();

                        // проверка на валидность даты
                        if (date_start !== 'Сегодня' && new Date(date_start) !== 'Invalid Date') date_start = date_start;
                        else if (date_start === 'Сегодня') date_start = new Date().toLocaleDateString();
                        else date_start = null;

                        if (date_end !== 'Сегодня' && new Date(date_end) !== 'Invalid Date') date_end = date_end;
                        else if (date_end === 'Сегодня') date_end = new Date().toLocaleDateString();
                        else date_end = null;

                        // если дата один день (от и до Сегодня)
                    } else if (filter_date === 'Сегодня') date_start = date_end = new Date().toLocaleDateString();

                    // если дата один день (от и до совпадают)
                    else if (new Date(filter_date) !== 'Invalid Date') date_start = date_end = filter_date;

                    // иначе обнуляем дату
                    else date_start = date_end = null;
                }

                // сохраняем результат
                filter_date = {};
                // выбор даты из списка или вручную
                filter_date.date_from = date_from || date_start;
                filter_date.date_to = date_to || date_end;

                // если результат стандартный, обнуляем значение
                if (filter_date.date_from === 'За все время' || filter_date.date_to === 'За все время') {
                    filter_date.date_from = null;
                    filter_date.date_to = null;
                }

                // если ни один из вариантов не определен, обнуляем
                if (!(filter_date.date_from && filter_date.date_to)) result.filter_date = null;
                else result.filter_date = filter_date;
            }

            // массив менеджеров
            if (!self.filter_managers.length) result.filter_managers = null;
            else {
                $.each(self.filter_managers, function () { filter_managers.push(this.title) });
                result.filter_managers = filter_managers;
            }

            return result;
        }

        // выгрузка фильтра из БД
        const ajaxParamsFilter = function (params) {
            // удаляем старый результат
            if ($('.list__table__holder').length) $('.list__table__holder').remove();

            // для подкраски столбцов синим цветом
            let date_blue = false, managers_blue = false;
            if (params.filter_date) date_blue = true;
            if (params.filter_managers) managers_blue = true;

            // запрос в БД
            $.ajax({
                url: url_link_t,
                method: 'POST',
                data: {
                    'domain': document.domain,
                    'method': 'filter_events',
                    'filter': params
                },
                dataType: 'json',
                success: function (data) {
                    // показываем количество строк и очищаем прошлый результат
                    $('.list-top-search__summary-text').text(`${ data.results.length } событий`);
                    if ($('.list__table__holder').length) $('.list__table__holder').remove();

                    // если масссив пустой, обнуляем количество строк в фильтре, удаляем старый результат и выходим
                    if (!data.results.length) return;

                    // заголовок
                    $('.safety_settings__section_new.tasks_search').after(`
                        <div class="list__table__holder js-hs-scroller custom-scroll hs-wrapper_no-hand" 
                            style="margin-bottom: 0px; width: 100%; padding-left: 0; z-index: 1;">
                            <div class="js-scroll-container list__table" id="list_table" style="width: 100%; padding: 0;">

                                <div class="list-row list-row-head js-list-row js-list-row-head" id="list_head">
                                    <div class="list-row__cell js-hs-prevent js-resizable-cell 
                                        list-row__cell-head cell-head js-cell-head  list-row__cell-template-text 
                                        list-row__cell-name  ui-resizable" data-field-template="text" style="width: 12%;">
                                        <div class="cell-head__inner">
                                            <div class="cell-head__inner-content">
                                                <span class="cell-head__dots icon icon-v-dots"></span>
                                                <span class="cell-head__title filter__blue__date">Дата</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="list-row__cell js-hs-prevent js-resizable-cell list-row__cell-head 
                                        cell-head js-cell-head  list-row__cell-template-text list-row__cell-name  
                                        ui-resizable" data-field-template="text" style="width: 24%;">
                                        <div class="cell-head__inner">
                                            <div class="cell-head__inner-content">
                                                <span class="cell-head__dots icon icon-v-dots"></span>
                                                <span class="cell-head__title filter__blue__manager">Автор</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="list-row__cell js-hs-prevent js-resizable-cell list-row__cell-head 
                                        cell-head js-cell-head  list-row__cell-template-text list-row__cell-name  
                                        ui-resizable" data-field-template="text" style="width: 12%;">
                                        <div class="cell-head__inner">
                                            <div class="cell-head__inner-content">
                                                <span class="cell-head__dots icon icon-v-dots"></span>
                                                <span class="cell-head__title">Время</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="list-row__cell js-hs-prevent js-resizable-cell list-row__cell-head 
                                        cell-head js-cell-head  list-row__cell-template-text list-row__cell-name  
                                        ui-resizable" data-field-template="text" style="width: 12%;">
                                        <div class="cell-head__inner">
                                            <div class="cell-head__inner-content">
                                                <span class="cell-head__dots icon icon-v-dots"></span>
                                                <span class="cell-head__title">Сумма</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="list-row__cell js-hs-prevent js-resizable-cell list-row__cell-head 
                                        cell-head js-cell-head  list-row__cell-template-text list-row__cell-name  
                                        ui-resizable" data-field-template="text" style="width: 40%;">
                                        <div class="cell-head__inner">
                                            <div class="cell-head__inner-content">
                                                <span class="cell-head__dots icon icon-v-dots"></span>
                                                <span class="cell-head__title">Ссылка на задачу</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    `);

                    // если менеджер или дата указаны в фильтре, красим столбец в синий
                    if (date_blue) $('.filter__blue__date').css('color', '#2798d5');
                    if (managers_blue) $('.filter__blue__manager').css('color', '#2798d5');

                    $.each(data.results, function () {
                        let date = this[9],
                            autor = this[3],
                            time = this[12],
                            sum = this[7],
                            link = this[8],
                            timer_ID = this[0],
                            event = false; // событие как пополнение депозита

                        if (this[3] === 'Пополнение депозита') {
                            event = true;
                            time = '00:00:00';
                        }

                        date = date.split(' ')[0];

                        $('#list_table').append(`
                            <div class="list-row js-list-row js-pager-list-item__1" data-id="${ timer_ID }">
                                <div class="list-row__cell js-list-row__cell list-row__cell-template-text 
                                    list-row__cell-author list-row__cell_filtered">
                                    <div class="content-table__item__inner" title="${ date }">
                                        <span class="block-selectable date">${ date }</span>
                                    </div>
                                </div>

                                <div class="list-row__cell js-list-row__cell list-row__cell-template-text 
                                    list-row__cell-author list-row__cell_filtered">
                                    <div class="content-table__item__inner" title="${ autor }">
                                        <span class="block-selectable autor">${ autor }</span>
                                    </div>
                                </div>

                                <div class="list-row__cell js-list-row__cell list-row__cell-template-text 
                                    list-row__cell-author list-row__cell_filtered">
                                    <div class="content-table__item__inner" title="${ event ? '' : time }">
                                        <span class="block-selectable time">${ event ? '' : time }</span>
                                    </div>
                                </div>

                                <div class="list-row__cell js-list-row__cell list-row__cell-template-text 
                                    list-row__cell-author list-row__cell_filtered">
                                    <div class="content-table__item__inner" title="${ sum }">
                                        <span class="block-selectable sum">${ sum } р.</span>
                                    </div>
                                </div>

                                <div class="list-row__cell js-list-row__cell list-row__cell-template-event_object 
                                    list-row__cell-object">
                                    <div class="content-table__item__inner">
                                        <a class="list-row__template-name__table-wrapper__name-link js-navigate-link" 
                                        href="${ link }" title="${ link }" target="_blank">${ link }</a>
                                    </div>
                                </div>
                            </div>
                        `);

                        if (autor === 'Пополнение депозита') {
                            $(`.list-row[data-id="${ timer_ID }"] .list-row__cell`).css('background', '#c7efc2');
                        }

                    });

                    // вывод итога таблицы
                    $('.list__table__holder').after(`
                        <div class="list__table__holder js-hs-scroller custom-scroll hs-wrapper_no-hand" 
                            style="margin-bottom: 0px; width: 100%; padding-left: 0; z-index: 1; margin-top: 10px;">
                            <div class="js-scroll-container list__table" id="list_table" style="width: 100%; padding: 0;">

                                <div class="list-row js-list-row js-pager-list-item__1">
                                    <div class="list-row__cell js-list-row__cell list-row__cell-template-text 
                                        list-row__cell-author list-row__cell_filtered" style="width: 85%;">
                                        <div class="content-table__item__inner" 
                                            title="Общее количество затраченного времени">
                                            <span class="block-selectable" style="display: flex; justify-content: right;">
                                                Общее количество затраченного времени
                                            </span>
                                        </div>
                                    </div>

                                    <div class="list-row__cell js-list-row__cell list-row__cell-template-text 
                                        list-row__cell-author list-row__cell_filtered" style="width: 15%;">
                                        <div class="content-table__item__inner" title="${ data.all_time }">
                                            <span class="block-selectable">
                                                <span class="all__time__results">${ data.all_time }</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div class="list__table__holder js-hs-scroller custom-scroll hs-wrapper_no-hand" 
                            style="margin-bottom: 0px; width: 100%; padding-left: 0; z-index: 1;">
                            <div class="js-scroll-container list__table" id="list_table" style="width: 100%; padding: 0;">

                                <div class="list-row js-list-row js-pager-list-item__1">
                                    <div class="list-row__cell js-list-row__cell list-row__cell-template-text 
                                        list-row__cell-author list-row__cell_filtered" style="width: 85%;">
                                        <div class="content-table__item__inner" title="Общая сумма списания">
                                            <span class="block-selectable" style="display: flex; justify-content: right;">
                                            Общая сумма списания
                                            </span>
                                        </div>
                                    </div>

                                    <div class="list-row__cell js-list-row__cell list-row__cell-template-text 
                                        list-row__cell-author list-row__cell_filtered" style="width: 15%;">
                                        <div class="content-table__item__inner" title="${ data.all_sum } p.">
                                            <span class="block-selectable">
                                                <span class="all__sum__results">${ data.all_sum }</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    `);

                    // останавливаем стандартное поведение ссылки, чтобы она открылась в новом окне
                    $('.list-row__cell.list-row__cell-template-event_object').unbind('click');
                    $('.list-row__cell.list-row__cell-template-event_object').bind('click', function (e) {
                        e.stopPropagation();
                    });
                },
                timeout: 2000
            });
        }

        // кнопка применить
        const applyBtn = function () {
            // вставляем дату в заголовок фильтра (берем значение без скобок (даты))
            let filter_date = $('.date_filter .date_filter__head .date_filter__period').text().trim();
            self.filter_date = filter_date;
            filter_date = filter_date.split('(')[0].trim();

            // если wrapper'а нет, добавляем
            if (!$('.list-top-search .search-options').length) {
                $('.list-top-search').prepend(`
                    <div class="search-options" id="search-options">
                        <div class="list-top-search__preset" id="search_filter_preset"></div>
                        <div class="search-options-wrapper"></div>
                    </div>
                `);
            }

            // удаляем старое значение
            if ($('.search-options-wrapper .date__filter__icon').length) {
                $('.search-options-wrapper .date__filter__icon').remove();
            }

            // вставляем новое значение (если оно не по умолчанию)
            if (filter_date !== 'За все время') {
                $('.list-top-search .search-options-wrapper').append(`
                    <div class="list-top-search__options date__filter__icon list-top-search__options-showed">
                        <div class="options-text" title="Созданы: ${ filter_date }">Созданы: ${ filter_date }</div>
                        <div class="option-delete js-filter-field-clear" data-input-name="filter[date_preset]">
                            <svg class="svg-icon svg-common--cross-close-dims">
                                <use xlink:href="#common--cross-close"></use>
                            </svg>
                        </div>
                    </div>
                `);
            }

            // перебираем менеджеров с заголовка и обновляем массив
            let managers = [];

            if ($('.multisuggest__list-item.js-multisuggest-item').length) {
                $.each($('.multisuggest__list-item.js-multisuggest-item'), function () {
                    managers.push({
                        'title' : $(this).attr('data-title').trim(),
                        'group' : $(this).attr('data-group').trim(),
                        'id' : $(this).attr('data-id').trim(),
                    });
                });
            }

            // если менеджеры есть, пишем в массив, иначе обнуляем массив
            if (managers.length) self.filter_managers = managers;
            else self.filter_managers = [];

            // если менеджер один, пишем имя, иначе количество
            if (managers === 1) managers = self.filter_managers[0].title;
            else managers = self.filter_managers.length;

            // удаляем старое значение
            if ($('.search-options-wrapper .managers__filter__icon').length) {
                $('.search-options-wrapper .managers__filter__icon').remove();
            }

            // вставляем новое значение (если менеджеры есть в массиве)
            if (self.filter_managers.length) {
                if (!$('.list-top-search .search-options').length) {
                    $('.list-top-search').prepend(`
                        <div class="search-options" id="search-options">
                            <div class="list-top-search__preset" id="search_filter_preset"></div>
                            <div class="search-options-wrapper"></div>
                        </div>
                    `);
                }

                $('.list-top-search .search-options-wrapper').append(`
                    <div class="list-top-search__options managers__filter__icon list-top-search__options-showed">
                        <div class="options-text" title="Менеджеры: ${ managers }">Менеджеры: ${ managers }</div>
                        <div class="option-delete js-filter-field-clear" data-input-name="filter[main_user][]">
                            <svg class="svg-icon svg-common--cross-close-dims">
                                <use xlink:href="#common--cross-close"></use>
                            </svg>
                        </div>
                    </div>
                `);
            }

            // если есть какие-то фильтры, прячем кнопку Применить и показываем кнопку очистки фильтра
            if (filter_date !== 'За все время' || self.filter_managers.length) {
                if (!$('.list-top-search .list-top-search__apply-block').hasClass('h-hidden')) {
                    $('.list-top-search .list-top-search__apply-block').addClass('h-hidden');
                }

                if ($('#search_clear_button').hasClass('h-hidden')) {
                    $('#search_clear_button').removeClass('h-hidden');
                }

                // кнопка сбросить в фильтре
                $('#search_clear_button').unbind('click');
                $('#search_clear_button').bind('click', clearBtn);

                // иначе прячем кнопки фильтра
            } else if (filter_date === 'За все время' && !self.filter_managers.length) {

                if (!$('.list-top-search .list-top-search__apply-block').hasClass('h-hidden')) {
                    $('.list-top-search .list-top-search__apply-block').addClass('h-hidden');
                }

                if (!$('#search_clear_button').hasClass('h-hidden')) {
                    $('#search_clear_button').addClass('h-hidden');
                }
            }

            deleteFilterDate(); // удаление даты с фильтра
            deleteFilterManagers(); // удаление менеджеров с фильтра

            // если значение не по умолчанию, делаем запрос в БД, иначе очищаем фильтр
            if (!(filter_date === 'За все время' && !self.filter_managers.length)) {
                ajaxParamsFilter(getParamsFilter());
            } else clearBtn();

            // удаляем окно фильтра
            $('.settings__search__filter .js-filter-sidebar.filter-search').remove();
        }

        // кнопки применить и сбросить
        const applyClearBtn = function () {
            // добавляем класс для кнопок
            if (!$('.js-filter-sidebar.filter-search').hasClass('filter-search_has-changes')) {
                $('.js-filter-sidebar.filter-search').addClass('filter-search_has-changes');
            }

            // добавляем кнопки
            if (!$('#search-suggest-drop-down-menu').length) {
                $('.js-filter-sidebar.filter-search').append(`
                    <div id="search-suggest-drop-down-menu" class="search-results custom-scroll">
                        <div id="search-suggest-drop-down-menu_container"></div>
                    </div>

                    <div class="modal-body__actions filter__params_manage" style="margin-right: 0px;">
                        <button type="button" class="button-input js-modal-accept js-button-with-loader 
                            modal-body__actions__save button-input_blue filter__params_manage__apply" 
                            tabindex="1" id="filter_apply">
                            <span class="button-input-inner ">
                                <span class="button-input-inner__text">Применить</span>
                            </span>
                        </button>

                        <button type="button" class="button-input button-cancel js-search-filter-clear" 
                            tabindex="2" style="">
                            <span>Сбросить</span>
                        </button>
                    </div>
                `);
            }

            // кнопка применить
            $('.modal-body__actions .modal-body__actions__save').unbind('click');
            $('.modal-body__actions .modal-body__actions__save').bind('click', applyBtn);

            // кнопка сбросить
            $('.modal-body__actions .button-cancel').unbind('click');
            $('.modal-body__actions .button-cancel').bind('click', clearBtn);
        }

        // кнопка применить в фильтре
        const applyFilterBtn = function () {
            if ($('.list-top-search .list-top-search__apply-block').hasClass('h-hidden')) {
                $('.list-top-search .list-top-search__apply-block').removeClass('h-hidden');
            }

            $('.list-top-search .list-top-search__apply-block').unbind('click');
            $('.list-top-search .list-top-search__apply-block').bind('click', applyBtn);
        }

        // удаление даты с фильтра
        const deleteFilterDate = function () {
            $('.list-top-search__options.date__filter__icon .option-delete').unbind('click');
            $('.list-top-search__options.date__filter__icon .option-delete').bind('click', function () {
                // удаление фильтра
                $('.list-top-search__options.date__filter__icon').remove();
                // очищаем результат количества событий
                $('.list-top-search__summary-text').text('0 событий');

                // если фильтр последний, удаляем wrapper фильтра и кнопку очистки фильтра
                if (!$('.search-options .list-top-search__options').length) {
                    $('#search-options').remove();

                    if (!$('#search_clear_button').hasClass('h-hidden')) {
                        $('#search_clear_button').addClass('h-hidden');
                    }

                    // обнуляем значениe даты
                    self.filter_date = null;
                    // удаляем старый результат
                    if ($('.list__table__holder').length) $('.list__table__holder').remove();

                    // иначе обнуляем значениe даты и делаем запрос в БД
                } else {
                    self.filter_date = null;
                    ajaxParamsFilter(getParamsFilter());
                }
            });
        }

        // удаление менеджеров с фильтра
        const deleteFilterManagers = function () {
            $('.list-top-search__options.managers__filter__icon .option-delete').unbind('click');
            $('.list-top-search__options.managers__filter__icon .option-delete').bind('click', function () {
                // удаление фильтра
                $('.list-top-search__options.managers__filter__icon').remove();
                // очищаем результат количества событий
                $('.list-top-search__summary-text').text('0 событий');

                // если фильтр последний, удаляем wrapper фильтра и кнопку очистки фильтра
                if (!$('.search-options .list-top-search__options').length) {
                    $('#search-options').remove();

                    if (!$('#search_clear_button').hasClass('h-hidden')) {
                        $('#search_clear_button').addClass('h-hidden');
                    }

                    // обнуляем массив менеджеров
                    self.filter_managers = [];
                    // удаляем старый результат
                    if ($('.list__table__holder').length) $('.list__table__holder').remove();

                    // иначе обнуляем массив менеджеров и делаем запрос в БД
                } else {
                    self.filter_managers = [];
                    ajaxParamsFilter(getParamsFilter());
                }
            });
        }

        // выбор даты
        const getDate = function () {
            $('.filter-search__right .date_filter__head').on('DOMSubtreeModified', function() {
                // если рамки нет, добавляем
                if (!$('.filter-search__right .filter__custom_settings__item.date__filter').hasClass('glow')) {
                    $('.filter-search__right .filter__custom_settings__item.date__filter').addClass('glow');
                }

                // если ранее были открыты менеджеры, восстанавливаем wrapper менеджеров
                $('.filter__managers').css('height', '0');

                // добавляем кнопку применить в фильтре
                applyFilterBtn();
                // добавляем кнопки применить и сбросить в окне фильтра
                applyClearBtn();
            });

            // если открыт дата фильтр, закрываем список менеджеров
            $('.filter-search__right').on('DOMSubtreeModified', function() {
                // let managers = [];

                if ($('.date_filter .date_filter__dropdown').css('display') === 'block') {
                    if (!$('.filter__managers .multisuggest__suggest-wrapper').length) return;

                    $('.filter__managers .multisuggest__suggest-wrapper').remove();
                    $('.multisuggest__list.js-multisuggest-list').removeClass('js-multisuggest-loading');

                    if ($('.multisuggest__list.js-multisuggest-list').find('.multisuggest__list-item_input')) {
                        $('.multisuggest__list.js-multisuggest-list .multisuggest__list-item_input').remove();
                    }

                    // если менеджеры есть, добавляем возможность очистки
                    if ($('.multisuggest__list .multisuggest__list-item').length) {
                        // если рамки нет, добавляем
                        if (!$('.filter-search__right .filter-search__users-select-holder').hasClass('glow')) {
                            $('.filter-search__right .filter-search__users-select-holder').addClass('glow');
                        }
                    }
                }
            });
        }

        // удаление из списка менеджеров
        const deleteManagersForTitle = function () {
            // нажатие на менеджера
            $('.multisuggest__list-item.js-multisuggest-item').unbind('click');
            $('.multisuggest__list-item.js-multisuggest-item').bind('click', function (e) {
                // останавливаем стандартное поведение
                e.stopPropagation();

                // имя, группа и ID нажатого менеджера
                let manager = $(e.target).closest('.multisuggest__list-item.js-multisuggest-item'),
                    manager_ID = manager.attr('data-id'),
                    manager_group = manager.attr('data-group');

                // удаляем менеджера
                $(manager).remove();

                // если группа ранее была скрыта, показываем
                if ($(`.users-select__head-allgroup[data-id="${ manager_group }"]`)
                    .closest('.users-select-row__inner').css('display') === 'none') {

                    $(`.users-select__head-allgroup[data-id="${ manager_group }"]`)
                        .closest('.users-select-row__inner').css('display', 'block');
                }

                // показываем менеджера в списке
                $(`#select_users__user-${ manager_ID }`).css('display', 'block');

                // если удален последний менеджер, снимаем рамку
                if (!$('.multisuggest__list-item.js-multisuggest-item').length) {
                    $('.filter-search__right .filter-search__users-select-holder').removeClass('glow');
                }

                // добавляем кнопку применить в фильтре
                applyFilterBtn();
                // добавляем кнопки применить и сбросить в окне фильтра
                applyClearBtn();
            });
        }

        // список менеджеров
        const getManagers = function () {
            $('.filter-search__right .custom-scroll').unbind('click');
            $('.filter-search__right .custom-scroll').bind('click', function (e) {
                // если уже открыт, выходим
                if ($('.filter__managers .multisuggest__suggest-wrapper').length) return;

                // добавляем wrapper
                $('.filter-search__right .filter__managers').append(`
                <div class="multisuggest__suggest-wrapper suggest-manager users-select-suggest filter__users-select-suggest" 
                    style="top: 0; left: 0; position: absolute; display: block; width: 300px; height: auto;" 
                        data-is-suggest="y">
                        <div class="multisuggest__suggest js-multisuggest-suggest custom-scroll" 
                            style="max-height: 300px;">
                            <div class="users-select-row custom-scroll"></div>
                        </div>
                    </div>
                `);

                $('.multisuggest__list.js-multisuggest-list').addClass('js-multisuggest-loading');

                // добавляем инпут для отображения hover
                $('.multisuggest__list.js-multisuggest-list').append(`
                    <li class="multisuggest__list-item multisuggest__list-item_input">
                        <span class="js-multisuggest-hint multisuggest__hint">Менеджеры</span>
                    </li>
                `);

                // менеджеры и группы AMO
                let groups = AMOCRM.constant('groups'),
                    managers = AMOCRM.constant('managers');

                // перебираем группы
                $.each(groups, function (key, value) {
                    let users = [], group_ID = key;

                    $.each(managers, function () {
                        if (this.group != key) return;
                        if (!this.active) return;

                        users.push({id: this.id, title: this.title});
                    });

                    // если в группе нет менеджеров, пропускаем ее
                    if (!users.length) return;

                    // добавляем группу в список
                    $('.filter-search__right .filter__managers .users-select-row').append(`
                        <div class="users-select-row__inner group-color-wrapper">
                            <div class="users-select__head group-color  js-multisuggest-item multisuggest__suggest-item" 
                                data-title="${ value }" data-group="y" data-id="${ key }" style="height: 35px;">
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

                    // перебираем менеджеров
                    $.each(users, function () {
                        let user_ID = this.id;
                        let user_title = this.title;

                        // добавляем менеджеров
                        $(`.filter-search__right .users-select__body[data-id=${ key }]`).append(`
                        <div class="users-select__body__item" id="select_users__user-${ user_ID }" style="display: block;">
                            <div class="multisuggest__suggest-item js-multisuggest-item true" data-group="${ key }" data-id="${ user_ID }">
                                ${ user_title }
                                <span data-id="${ user_ID }" class="control-user_state"></span>
                            </div>
                        </div>
                    `);
                    });

                    // если менеджер ранее выбран, прячем в списке
                    if ($('.multisuggest__list .multisuggest__list-item')) {
                        let group, item_group, ID, is_visible = false;;

                        // если менеджер в заголовке, прячем в списке
                        $.each($('.multisuggest__list .multisuggest__list-item'), function () {
                            ID = $(this).attr('data-id');
                            $(`.users-select__body__item[id="select_users__user-${ ID }"]`).css('display', 'none');
                        });

                        // если менеджеров в списке больше нет, скрываем группу
                        group = $(`.users-select-row__inner .users-select__body[data-id="${ group_ID }"]`);
                        item_group = group.find('.users-select__body__item');

                        $.each(item_group, function () { if ($(this).css('display') === 'block') is_visible = true });
                        if (!is_visible) $(group).closest('.users-select-row__inner').css('display', 'none');
                    }
                });

                // ровняем менеджеров и скролл
                $('.filter-search__right .filter__managers').css('height', '300px');
                $('.filter-search__right .users-select-row').css({
                    'overflow-x': 'hidden', 'overflow-y': 'auto', 'max-width': '300px'
                });

                // клик по свободному месту для закрытия списка менеджеров
                $('.settings__search__filter .filter-search__inner').unbind('click');
                $('.settings__search__filter .filter-search__inner').bind('click', function (e) {
                    let managers = [];

                    // если список менеджеров не открыт, выходим
                    if (!$('.filter__managers .multisuggest__suggest-wrapper').length) return;
                    // если клик по списку менеджеров, выходим
                    if (e.target.closest('.filter__managers .multisuggest__suggest')) return;
                    // если клик по заголовку менеджеров, выходим
                    if (e.target.closest('.filter-search__right .custom-scroll')) return;

                    // удаляем список менеджеров и ровняем wrapper
                    $('.filter__managers .multisuggest__suggest-wrapper').remove();
                    $('.filter-search__right .filter__managers').css('height', '0');
                    $('.multisuggest__list.js-multisuggest-list').removeClass('js-multisuggest-loading');

                    // удаляем инпут заголовка менеджеров
                    if ($('.multisuggest__list.js-multisuggest-list').find('.multisuggest__list-item_input')) {
                        $('.multisuggest__list.js-multisuggest-list .multisuggest__list-item_input').remove();
                    }

                    // если менеджеры есть, добавляем возможность очистки
                    if ($('.multisuggest__list .multisuggest__list-item').length) {
                        // если рамки нет, добавляем
                        if (!$('.filter-search__right .filter-search__users-select-holder').hasClass('glow')) {
                            $('.filter-search__right .filter-search__users-select-holder').addClass('glow');
                        }

                        // добавляем кнопку применить в фильтре
                        applyFilterBtn();
                        // добавляем кнопки применить и сбросить в окне фильтра
                        applyClearBtn();
                    }
                });

                // отображение менеджера в заговлоке при смене курсора
                $('.filter__managers .users-select__head-title').bind('mouseenter', function (e) {
                    let title = $(e.target).find('.users-select__head-title-text').text();
                    $('.multisuggest__list .multisuggest__hint').text(title);
                });

                $('.filter__managers .users-select__body__item').bind('mouseenter', function (e) {
                    let title = $(e.target).text().trim();
                    $('.multisuggest__list .multisuggest__hint').text(title);
                });

                // клик на менеджера
                $('.filter__managers .users-select__body__item').unbind('click');
                $('.filter__managers .users-select__body__item').bind('click', function (e) {
                    // останавливаем стандартное поведение
                    e.stopPropagation();

                    // заголовок, группа и ID менеджера
                    let title = $(e.target).text().trim();
                    let group = $(e.target).attr('data-group');
                    let ID = $(e.target).attr('data-id');
                    let is_visible = false;

                    // добавляем менеджера в заголовок
                    $('.multisuggest__list-item.multisuggest__list-item_input').before(`
                        <li class="multisuggest__list-item js-multisuggest-item" data-title="${ title }" 
                            data-group="${ group }" data-id="${ ID }">
                            <input type="text" class="js-focuser" readonly="readonly" 
                                onkeydown="([13,8].indexOf(event.which)+1)&amp;&amp;this.parentNode.click()" 
                                onclick="return false">
                            <span>${ title }</span>
                            <input type="checkbox" checked="checked" class="hidden" name="" 
                                id="cbx_drop_${ ID }" value="${ ID }">
                        </li>
                    `);

                    // прячем из списка менеджеров
                    $(`.users-select__body__item[id="select_users__user-${ ID }"]`).css('display', 'none');

                    // если менеджеров в списке больше нет, скрываем группу
                    $.each($(e.target).closest('.users-select__body').find('.users-select__body__item'), function () {
                        if ($(this).css('display') === 'block') is_visible = true;
                    });

                    if (!is_visible) $(e.target).closest('.users-select-row__inner').css('display', 'none');

                    // удалениe менеджера с заголовка менеджеров
                    deleteManagersForTitle();
                });

                // клик на группу менеджеров
                $('.filter__managers .users-select__head-title').unbind('click');
                $('.filter__managers .users-select__head-title').bind('click', function (e) {
                    // останавливаем стандартное поведение
                    e.stopPropagation();

                    // ID группы
                    let group_ID = $(this).find('.users-select__head-allgroup').attr('data-id');

                    // перебираем менеджеров в этой группе
                    $.each($(`.users-select__body[data-id="${ group_ID }"] .users-select__body__item`), function () {
                        // заголовок, группа и ID менеджера
                        let title = $(this).find('.multisuggest__suggest-item').text().trim();
                        let group = $(this).find('.multisuggest__suggest-item').attr('data-group');
                        let ID = $(this).find('.multisuggest__suggest-item').attr('data-id');

                        // добавляем менеджеров в заголовок
                        if (!$(`.multisuggest__list .multisuggest__list-item[data-id="${ID}"]`).length) {
                            $('.multisuggest__list-item.multisuggest__list-item_input').before(`
                                <li class="multisuggest__list-item js-multisuggest-item" data-title="${ title }" 
                                    data-group="${ group }" data-id="${ ID }">
                                    <input type="text" class="js-focuser" readonly="readonly" 
                                        onkeydown="([13,8].indexOf(event.which)+1)&amp;&amp;this.parentNode.click()" 
                                        onclick="return false">
                                    <span>${ title }</span>
                                    <input type="checkbox" checked="checked" class="hidden" name="" 
                                        id="cbx_drop_${ ID }" value="${ ID }">
                                </li>
                            `);
                        }

                        // прячем из списка менеджеров
                        $(`.users-select__body__item[id="select_users__user-${ ID }"]`).css('display', 'none');
                        $(`.users-select__body[data-id="${group_ID}"]`).closest('.users-select-row__inner').css('display', 'none');
                    });

                    // удалениe менеджера с заголовка менеджеров
                    deleteManagersForTitle();
                });
            });
        }

        // сброс заголовка календаря
        const clearTitleDate = function () {
            $('.js-filter-field-clear.clear__date').unbind('click');
            $('.js-filter-field-clear.clear__date').bind('click', function () {
                // пишем стандартное значение
                $('.date_filter .date_filter__head span').attr('data-before', 'За все время');
                $('.date_filter .date_filter__head span').text('За все время');
                // удаляем рамку
                $('.filter-search__right .filter__custom_settings__item.date__filter').removeClass('glow');

                // удаляем классы у выбранных дат календаря
                $.each($('.date_filter .date_filter__period_item'), function () {
                    if ($(this).hasClass('date_filter__period_item_selected')) {
                        $(this).removeClass('date_filter__period_item_selected');
                    }
                });

                // добавляем кнопку применить в фильтре
                applyFilterBtn();
                // добавляем кнопки применить и сбросить в окне фильтра
                applyClearBtn();
            });
        }

        // сброс заголовка менеджеров
        const clearTitleManagers = function () {
            $('.js-filter-field-clear.clear__managers').unbind('click');
            $('.js-filter-field-clear.clear__managers').bind('click', function () {
                // удаляем менеджеров и удаляем рамку
                $('.multisuggest__list .multisuggest__list-item').remove();
                $('.filter-search__right .filter-search__users-select-holder').removeClass('glow');

                // добавляем кнопку применить в фильтре
                applyFilterBtn();
                // добавляем кнопки применить и сбросить в окне фильтра
                applyClearBtn();
            });
        }

        // ранее сохраненное значение даты
        const isDate = function () {
            if (self.filter_date) {
                let fitter_date = null;

                // если выбрана дата из списка, проверяем какая
                filter_date = self.filter_date.split('(')[0].trim();

                // добавляем соответствующий класс
                $.each($('.date_filter .date_filter__period_item'), function () {
                    if ($(this).find('.custom_select__title').text().trim() === filter_date) {
                        $(this).addClass('date_filter__period_item_selected');
                    }
                });

                // меняем заголовок календаря
                $('.date_filter__period.custom_select__selected').attr('data-before', self.filter_date);
                $('.date_filter__period.custom_select__selected').text(self.filter_date);

                // если выбрана дата последних Х дней
                if (filter_date.indexOf('За последние') !== -1) {
                    // количество дней
                    filter_date = self.filter_date.split(' ')[2].trim();

                    // прописываем количество в заголовок и значение, добавляем класс выбора
                    $('.date_filter .date_filter__period_item[data-period="past_x_days"]')
                        .addClass('date_filter__period_item_selected');
                    $('.date_filter .date_filter__period_item-input-days').val(filter_date);
                }

                // если значение стандартное, удаляем рамку
                if (filter_date === 'За все время') {
                    if ($('.filter-search__right .filter__custom_settings__item.date__filter').hasClass('glow')) {
                        $('.filter-search__right .filter__custom_settings__item.date__filter').removeClass('glow');
                    }
                }

                // добавляем рамку
                if (!$('.filter-search__right .filter__custom_settings__item.date__filter').hasClass('glow') &&
                    filter_date !== 'За все время') {

                    $('.filter-search__right .filter__custom_settings__item.date__filter').addClass('glow');
                }
            }
        }

        // ранее сохраненное значение менеджеров
        const isManagers = function () {
            if (self.filter_managers.length) {
                let managers = self.filter_managers;

                // перебираем выбранных менеджеров
                $.each(managers, function () {
                    // добавляем в заголовок списка менеджеров
                    $('.multisuggest__list.js-multisuggest-list').append(`
                        <li class="multisuggest__list-item js-multisuggest-item" data-title="${ this.title }" 
                            data-group="${ this.group }" data-id="${ this.id }">
                            <input type="text" class="js-focuser" readonly="readonly" 
                                onkeydown="([13,8].indexOf(event.which)+1)&amp;&amp;this.parentNode.click()" 
                                onclick="return false">
                            <span>${ this.title }</span>
                            <input type="checkbox" checked="checked" class="hidden" name="" 
                                id="cbx_drop_${ this.id }" value="${ this.id }">
                        </li>
                    `);
                });

                // добавляем рамку
                if (!$('.filter-search__right .filter-search__users-select-holder').hasClass('glow')) {
                    $('.filter-search__right .filter-search__users-select-holder').addClass('glow');
                }

                // удалениe менеджера с заголовка менеджеров
                deleteManagersForTitle();
            }
        }

        // поведение кнопок по умолчанию
        const defaultBtn = function () {
            // прячем кнопку применить в фильтре
            if (!$('.list-top-search .list-top-search__apply-block').hasClass('h-hidden')) {
                $('.list-top-search .list-top-search__apply-block').addClass('h-hidden');
            }

            // прячем кнопки применить и сбросить в окне фильтра
            if ($('#search-suggest-drop-down-menu')) $('#search-suggest-drop-down-menu').remove();
            if ($('.js-filter-sidebar.filter-search .modal-body__actions')) {
                $('.js-filter-sidebar.filter-search .modal-body__actions').remove();
            }
        }

        // кнопка очистить фильтр
        const eventClearFilter = function () {
            if ($('#search_clear_button').hasClass('h-hidden')) {
                $('#search_clear_button').removeClass('h-hidden');

                $('#search_clear_button').unbind('click');
                $('#search_clear_button').bind('click', clearBtn);
            }
        }

        // события фильтра с левого меню
        const leftMenuEventsFilter = function () {
            // клик на все события
            $('.filter-search__left .filter__all__events').unbind('click');
            $('.filter-search__left .filter__all__events').bind('click', function (e) {
                let result = {};

                // останавливаем действие по умолчанию
                e.stopPropagation();
                e.preventDefault();

                // указываем параметры запроса в БД
                result.filter_date = null;
                result.filter_managers = null;

                // очищаем фильтр
                clearBtn();
                // показываем кнопку Очистить фильтр
                eventClearFilter();

                // запрос в БД
                ajaxParamsFilter(result);
            });

            // клик на мои события
            $('.filter-search__left .filter__my__events').unbind('click');
            $('.filter-search__left .filter__my__events').bind('click', function (e) {
                let result = {}, filter_managers = [];

                // останавливаем действие по умолчанию
                e.stopPropagation();
                e.preventDefault();

                // указываем параметры запроса в БД
                result.filter_date = null;
                filter_managers.push(AMOCRM.constant('user').name);
                result.filter_managers = filter_managers;

                // очищаем фильтр
                clearBtn();
                // показываем кнопку Очистить фильтр
                eventClearFilter();

                // запрос в БД
                ajaxParamsFilter(result);
            });

            // клик на события за сегодня
            $('.filter-search__left .filter__today__events').unbind('click');
            $('.filter-search__left .filter__today__events').bind('click', function (e) {
                let result = {}, date_from, date_to, filter_date = {};

                // останавливаем действие по умолчанию
                e.stopPropagation();
                e.preventDefault();

                // указываем параметры запроса в БД
                date_from = date_to = new Date().toLocaleDateString();
                filter_date.date_from = date_from;
                filter_date.date_to = date_to;

                result.filter_date = filter_date;
                result.filter_managers = null;

                // очищаем фильтр
                clearBtn();
                // показываем кнопку Очистить фильтр
                eventClearFilter();

                // запрос в БД
                ajaxParamsFilter(result);
            });

            // клик на события за вчера
            $('.filter-search__left .filter__yesterday__events').unbind('click');
            $('.filter-search__left .filter__yesterday__events').bind('click', function (e) {
                let result = {}, date_from, date_to, filter_date = {}, d;

                // останавливаем действие по умолчанию
                e.stopPropagation();
                e.preventDefault();

                // указываем параметры запроса в БД
                d = new Date();
                d = d.setDate(d.getDate() - 1);
                date_from = date_to = new Date(d).toLocaleDateString();
                filter_date.date_from = date_from;
                filter_date.date_to = date_to;

                result.filter_date = filter_date;
                result.filter_managers = null;

                // очищаем фильтр
                clearBtn();
                // показываем кнопку Очистить фильтр
                eventClearFilter();

                // запрос в БД
                ajaxParamsFilter(result);
            });

            // клик на события за месяц
            $('.filter-search__left .filter__month__events').unbind('click');
            $('.filter-search__left .filter__month__events').bind('click', function (e) {
                let result = {}, date_from, date_to, filter_date = {}, d;

                // останавливаем действие по умолчанию
                e.stopPropagation();
                e.preventDefault();

                // указываем параметры запроса в БД
                d = new Date();
                date_from = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 30).toLocaleDateString();
                date_to = new Date().toLocaleDateString();
                filter_date.date_from = date_from;
                filter_date.date_to = date_to;

                result.filter_date = filter_date;
                result.filter_managers = null;

                // очищаем фильтр
                clearBtn();
                // показываем кнопку Очистить фильтр
                eventClearFilter();

                // запрос в БД
                ajaxParamsFilter(result);
            });
        }


        // фильтр в разделе настроек
        this.advancedSettings = function () {
            let search_input = self.render(
                {ref: '/tmpl/common/search_block.twig'},
                {
                    loader_class_name: 'search__input',
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
                        <div class="settings__search__input" style="width: 100%;">${ search_input }</div>
    
                        <div class="list__top__actions settings__search__menu">
                            <div class="list-top-nav__icon-button list-top-nav__icon-button_dark 
                                list-top-nav__icon-button_context">
                                <div class="button-input-wrapper button-input-more content__top__action__btn-more">
                                
                                    <button type="button" class="button-input  button-input-with-menu" 
                                        tabindex="" title="Еще">
                                        <span class="button-input-inner button-input-more-inner">
                                            <svg class="svg-icon svg-controls--button-more-dims">
                                                <use xlink:href="#controls--button-more"></use>
                                            </svg>
                                        </span>
                                    </button>
    
                                    <ul class="button-input__context-menu ">
                                        <li class="button-input__context-menu__item  element__ js-list-export" 
                                            id="export" style="min-width: 120px;">
                                            <div class="button-input__context-menu__item__inner">
                                                <span class="button-input__context-menu__item__icon-container">
                                                    <svg class="button-input__context-menu__item__icon svg-icon 
                                                        svg-common--download-dims" style="justify-content: left;">
                                                        <use xmlns:xlink="http://www.w3.org/1999/xlink" 
                                                            xlink:href="#common--download">
                                                        </use>
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
                'margin-top': '10px', 'border-top': '1px solid #e8eaeb', 'border-bottom': '1px solid #e8eaeb'
            });
            $('.settings__search .list-top-search').css({ 'margin-left': '0' });
            $('.settings__search .button-input').css({ 'border': '0', 'background': '#fff', 'max-height': 'auto' });
            $('.settings__search .settings__search__menu').css({ 'margin-top': '10px' });
            $('.settings__search .list-top-search__input').attr('readonly', true);
            $('.settings__search .list-top-search__input-block').css('cursor', 'pointer');
            $('.settings__search .list-top-search__input').css('cursor', 'pointer');
            $('.settings__search .settings__search__menu').css({'padding-left': '10px', 'padding-right': '10px'});
            $('.settings__search .button-input__context-menu').css({'left': 'auto', 'right': '0'});

            // количество событий в фильтре
            $('.list-top-search .list-top-search__input-block .list-top-search__input').after(`
                <span class="list-top-search__summary">
                    <span class="list-top-search__summary-text">0 событий</span>
                </span>
            `);

            // клик по фильтру
            $('.settings__search .list-top-search__input-block').unbind('click');
            $('.settings__search .list-top-search__input-block').bind('click', function () {
                // если окно фильтра уже открыто, выходим
                if ($('.settings__search__filter .js-filter-sidebar.filter-search').length) return;

                // меню событий фильтра
                menuFilter();

                // клик по свободному месту для закрытия фильтра
                $('#page_holder').unbind('click');
                $('#page_holder').bind('click', function (e) {
                    // если фильтр не открыт, выходим
                    if (!$('.settings__search__filter .js-filter-sidebar.filter-search').length) return;
                    // если клик по диву фильтра, выходим
                    if ($(e.target).closest('.settings__search__filter .js-filter-sidebar.filter-search').length) return;
                    // если клик по инпуту фильтра, выходим
                    if ($(e.target).closest('.settings__search .list-top-search__input-block').length) return;
                    if ($(e.target).hasClass('.settings__search .list-top-search__input-block')) return;

                    // закрытие фильтра
                    filterClose();
                });

                getManagers(); // список менеджеров
                getDate(); // список менеджеров

                clearTitleDate(); // сброс заголовка календаря
                clearTitleManagers(); // сброс заголовка календаря

                isDate(); // ранее сохраненное значение даты
                isManagers(); // ранее сохраненное значение менеджеров

                // поведение кнопок по умолчанию
                defaultBtn();

                // события фильтра с левого меню
                leftMenuEventsFilter();
            });

            // экспорт таймеров
            $('.settings__search .settings__search__menu #export').unbind('click');
            $('.settings__search .settings__search__menu #export').bind('click', function (e) {
                let IDs = [];

                $.each($('.list-row.js-list-row.js-pager-list-item__1'), function () {
                    if (!$(this).attr('data-id')) return;
                    IDs.push($(this).attr('data-id'));
                });

                exportTimers(IDs);
            });
        }

        this.callbacks = {
            settings: function() {
                accessRight();
                self.saveConfigSettings();

                // $(`#${ self.get_settings().widget_code }_custom`).val('');
                // $(`#${ self.get_settings().widget_code }_custom`).trigger('change');

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
                if ((AMOCRM.getBaseEntity() === 'customers' || AMOCRM.getBaseEntity() === 'leads') && AMOCRM.isCard()) {
                    // отображаем таймер, если виджет авторизован
                    $.ajax({
                        url: url_link_t,
                        method: 'POST',
                        data: {
                            'domain': document.domain,
                            'method': 'is_auth'
                        },
                        dataType: 'html',
                        success: function (data) {
                            if (data) {
                                getTimersInfo(); // показываем таймер справа в меню
                                modalTimer(); // запускаем работу таймера
                            }
                        },
                        timeout: 2000
                    });
                }

                // обнуляем значение фильтра при рендере
                self.filter_date = null;
                self.filter_managers = [];

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
                // фильтр в разделе настроек
                self.advancedSettings();
            }
        };
        return this;
    };
    return CustomWidget_WidgetBilling;
});

// https://integratorgroup.k-on.ru/andreev/billing/token_get.php