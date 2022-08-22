// billing
define(['jquery', 'underscore', 'twigjs', 'lib/components/base/modal'], function($, _, Twig, Modal) {
    var CustomWidget_WidgetBilling = function() {
        var self = this,
            system = self.system,
            url_link_t = "https://integratorgroup.k-on.ru/andreev/billing/templates.php";

        // записываем отмеченных в настройках пользователей в массив managers
        const configToObject = function () {
            var config_settings = self.get_settings().config_settings || {};
            if (typeof config_settings !== 'string') config_settings = JSON.stringify(config_settings);
            config_settings = JSON.parse(config_settings);

            return config_settings;
        }

        // запуск таймера
        const startTimer = function () {
            $('.billing__link').bind('click', function (e) {
                e.preventDefault();

                // запуск модалки
                new Modal({
                    class_name: 'start__timer',
                    init: function ($modal_body) {
                        var $this = $(this);
                        $modal_body
                            .trigger('modal:loaded')
                            .html(`
                                <div class="modal__main-block" style="width: 100%; min-height: 0px;">
                                    <h2 class="modal-body__caption head_2">Запуск таймера</h2>
                                </div>
                            `)
                            .trigger('modal:centrify')
                            .append('');
                    },
                    destroy: function () {}
                });

                /* ############################################################### */

                // история
                $('.modal__main-block').css('position', 'relative');
                hystoryLink = `
                    <a href="#" class="hystory__link" style="
                        text-decoration: none;
                        color: #1375ab;
                        top: 0;
                        right: 0;
                        position: absolute;
                    ">История</a>
                `;
                $('.modal__main-block').append(hystoryLink);

                /* ############################################################### */

                // ссылка на проект
                var linkProject = `<a href="#" class="modal__link-project" style="
                        margin-top: 3px;
                        text-decoration: none;
                        color: #1375ab;
                        word-break: break-all;
                    " target="_blank">http://bla.bla/
                </a>`;

                // изменение ссылки
                var changeLinkProject = `<a href="#" class="change__link-project" style="
                        text-decoration: none;
                        color: #6b6d72;
                    ">(изменить)
                </a>`;

                // поле ввода ссылки
                var inputLinkProject = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                    name: 'modal-input-link-project',
                    class_name: 'modal__input__link-project',
                    value: '',
                    placeholder: 'вставьте ссылку на проект'
                });

                // wrapper
                var linkProjectWrapper = `<div class="modal__link-project__wrapper" style="width: 100%;">
                    <span style="width: 100%;">Ссылка на проект:</span><br/>
                </div>`;

                // добавляем ссылку проекта и ссылку (изменить)
                $('.modal__main-block').append(linkProjectWrapper);
                $('.modal__link-project__wrapper').append(linkProject);
                $('.modal__link-project').attr('href', $('.modal__link-project').text());
                $('.modal__link-project').after(changeLinkProject);

                // удаляем ссылку и вставляем поле ввода ссылки
                const changeLink = function (e) {
                    e.preventDefault();

                    $('.modal__link-project__wrapper').append(inputLinkProject);
                    $('.modal__input__link-project').css({
                        'width': '100%',
                        'margin-top': '3px'
                    }).focus();
                    $('.modal__input__link-project').val($('.modal__link-project').text().trim());
                    $('.modal__link-project').remove();
                    $('.change__link-project').remove();

                    // меняем ссылку, удаляем поле ввода и возвращаем ссылку
                    $('.modal__input__link-project').focusout(function (e) {
                        e.preventDefault();

                        $('.modal__link-project__wrapper').append(linkProject);
                        $('.modal__link-project').text($('.modal__input__link-project').val().trim() + ' ');
                        $('.modal__link-project').attr('href', $('.modal__link-project').text());
                        $('.modal__link-project').after(changeLinkProject);
                        $('.modal__input__link-project').remove();
                        $('.change__link-project').bind('click', changeLink);
                    });
                }
                $('.change__link-project').bind('click', changeLink);

                /* ############################################################### */

                // ссылка на задачу
                var inputLinkTask = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                    name: 'modal-input-link-task',
                    class_name: 'modal__input__link-task',
                    value: '',
                    placeholder: 'вставьте ссылку на задачу'
                });

                var linkTaskWrapper = `<div class="modal__link-task__wrapper" style="width: 100%; margin-top: 10px;">
                    <span style="width: 100%;">Ссылка на задачу:</span><br/>
                </div>`;

                // добавляем ссылку задачу
                $('.modal__main-block').append(linkTaskWrapper);
                $('.modal__link-task__wrapper').append(inputLinkTask);
                $('.modal__input__link-task').css({
                    'width': '100%',
                    'margin-top': '3px'
                });

                /* ############################################################### */

                // таймер
                var timerBtn = Twig({ ref: '/tmpl/controls/button.twig' }).render({
                    class_name: 'timer__btn',
                    text: 'Старт',
                });

                var timerWrapper = `<div class="modal__timer__wrapper" style="width: 100%; margin-top: 20px;">
                    <span style="font-size: 24px;">00:00:00</span>
                </div>`;

                $('.modal__main-block').append(timerWrapper);
                $('.modal__timer__wrapper').append(timerBtn);
                $('.timer__btn').css({
                    'margin-left': '20px',
                    'margin-top': '-8px'
                });









                /* ############################################################### */

                // запуск истории
                $('.hystory__link').unbind('click');
                $('.hystory__link').bind('click', function (e) {
                    e.preventDefault();

                    // получаем данные
                    var _data = {};
                    _data['domain'] = document.domain;
                    _data['method'] = 'hystory';
                    _data['essenceID'] = AMOCRM.data.current_card.id;
                    $.ajax({
                        url: url_link_t,
                        method: 'post',
                        data: _data,
                        dataType: 'html',
                        success: function(data) {
                            console.log(data)
                        }
                    });






                    new Modal({
                        class_name: 'hystory__timer',
                        init: function ($modal_body) {
                            var $this = $(this);
                            $modal_body
                                .trigger('modal:loaded')
                                .html(`
                                    <div class="modal__hystory-block" style="width: 100%; min-height: 550px;">
                                        <h2 class="modal-body__caption head_2">История</h2>
                                    </div>
                                `)
                                .trigger('modal:centrify')
                                .append('');
                        },
                        destroy: function () {}
                    });

                    // депозит
                    var inputHystoryDeposit = Twig({ ref: '/tmpl/controls/input.twig' }).render({
                        name: 'modal-input-hystory-deposit',
                        class_name: 'modal__input__hystory-deposit',
                        value: '20000',
                        placeholder: 'укажите депозит'
                    });

                    var HystoryDepositWrapper = `<div class="modal__hystory-deposit__wrapper" style="width: 100%; margin-top: 20px;">
                        <span >Депозит:</span>
                    </div>`;

                    $('.modal__hystory-block').append(HystoryDepositWrapper);
                    $('.modal__hystory-deposit__wrapper').append(inputHystoryDeposit);







                    $('.modal__hystory-block').append('<div class="modal__bottom" style="position: absolute; height: 70px; width: 100%"></div>');

                    // кнопка Закрыть
                    var cancelBtn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
                            class_name: 'modal__cancelBtn-hystory',
                            text: 'Закрыть'
                        }),
                        btnWrapper = '<div class="modal-body__actions" style="width: 100%; text-align: right;"></div>';

                    $('.modal__hystory-block').append(btnWrapper);
                    $('.modal__hystory-block .modal-body__actions').append(cancelBtn);
                    $('.modal__hystory-block .modal-body__actions').css('margin-top', '20px');
                    $('.modal__hystory-block').css('position', 'relative');
                    $('.modal__hystory-block .modal-body__actions').css({
                        'left': '0px',
                        'bottom': '0px',
                        'position': 'absolute'
                    });
                });








                // кнопка Закрыть
                var cancelBtn = Twig({ ref: '/tmpl/controls/cancel_button.twig' }).render({
                        class_name: 'modal__cancelBtn-timer',
                        text: 'Закрыть'
                    }),
                    btnWrapper = '<div class="modal-body__actions" style="width: 100%; text-align: right;"></div>';

                $('.modal__main-block').append(btnWrapper);
                $('.modal-body__actions').append(cancelBtn);
                $('.modal-body__actions').css('margin-top', '20px');

                // чтобы модальное окно не прижималось книзу (не смог исправить стандартный вариант)
                // $('.modal__main-block').append('<div class="modal__bottom" style="position: absolute; height: 70px; width: 100%"></div>');

                // нажатие на кнопку Сохранить
                // $('.modal__saveBtn-timer').unbind('click');
                // $('.modal__saveBtn-timer').bind('click', function () {
                //     console.log('save');
                //     $('.start__timer').remove();
                // });
            });
        }

        this.callbacks = {
            settings: function() {
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
                self.render_template({
                    body: '',
                    caption: { class_name: 'widget__billing' },
                    render: `<a href="#" class="billing__link" style="
                            font-size: 16px;
                            text-decoration: none;
                            color: #1375ab;
                            margin-left: 12px;
                            margin-top: 10px;
                        ">Запустить таймер</a>`
                });

                // запускаем модалку с таймером
                startTimer();

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
            advancedSettings: function() {}
        };
        return this;
    };
    return CustomWidget_WidgetBilling;
});

// https://integratorgroup.k-on.ru/andreev/billing/token_get.php