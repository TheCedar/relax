// 播放器控制代码
(function (window, document, undefined) {
    'use strict';

    var tool = {

        // 将类数组对象转换为数组
        toArray: function (target) {

            return window.Array.prototype.slice.call(target);
        }
    };

    function Slider(target, width, callback) {

        this._eventPc = {start: 'mousedown', move: 'mousemove', end: 'mouseup'};
        this._eventMobile = {start: 'touchstart', move: 'touchmove', end: 'touchend'};

        this._isMobile = this.isMobile();
        this.eventType = this._isMobile ? this._eventMobile : this._eventPc;

        this.slider = target;
        this.width = width;
        this.callback = callback;

        this.init();
    }

    Slider.prototype = {

        constructor: Slider,

        init: function () {

            this.event();
        },

        // 判断当前设备是否为移动设备
        isMobile: function () {

            return /(iPhone|iPad|iPod|Android|SymbianOS)/i.test(window.navigator.userAgent);
        },

        event: function () {
            this.slider.addEventListener(this.eventType.start, this.start.bind(this), false);

            this.slider.addEventListener(this.eventType.move, this.move.bind(this), false);

            this.slider.addEventListener(this.eventType.end, this.end.bind(this), false);
        },

        getValue: function () {

            return window.parseInt(this.slider.style.left) /100;
        },

        setValue: function (value) {

            // 节流处理，防止事件阻塞
            window.requestAnimationFrame(function () {

                this.slider.style.left = value.toFixed(2) * 100 + '%';
            }.bind(this));
        },

        _getPosition: function (ev) {

            return this._isMobile ? ev.touches[0].pageX : ev.pageX;
        },

        start: function (ev) {
            ev.stopPropagation();

            this._x = this._getPosition(ev);
            this.value = this.getValue();
        },

        move: function (ev) {
            ev.stopPropagation();

            var x = this._getPosition(ev);

            this._delta = x - this._x;
            this._x = x;

            this.value = this.value + this._delta / this.width;
            this.value = this.value > 1 ? 1 : (this.value < 0 ? 0 : this.value);

            this.setValue(this.value);
        },

        end: function (ev) {
            ev.stopPropagation();

            this.callback(this.value);
        }
    };

    function Player(target) {

        this.initStatus = false;
        this.player = target;
        this.audio = target.querySelector('audio');

        this.player.addEventListener('click', this.init.bind(this), false);
    }

    Player.prototype = {

        constructor: Player,

        init: function () {

            if (!this.initStatus) {

                this.initStatus = true;

                // 开始加载音频
                if (this.audio.preload === 'none') {

                    this.audio.load();
                }

                this.play();
                this.audio.volume = this._randomVolume();

                var slider = this.player.querySelector('.slider');
                this.control = new Slider(slider, slider.parentElement.scrollWidth, function (value) {

                    this.setVolume(value);
                }.bind(this));
                this.control.setValue(this.audio.volume);
            } else {

                if (this.audio.paused) {

                    this.play();
                } else {

                    this.pause();
                }
            }
        },

        play: function () {

            this.audio.play();
            this.player.classList.add('active');
        },

        pause: function () {

            this.audio.pause();
            this.player.classList.remove('active');
        },

        _randomVolume: function () {

            return Math.random() * 0.8 + 0.2;
        },

        getVolume: function () {

            return this.audio.volume;
        },

        setVolume: function (value) {

            this.audio.volume = value;
        }
    };

    // 为声音按钮注册事件
    var soundList = {},
        list = tool.toArray(document.getElementById('sound-list').querySelectorAll('li'));

    list.forEach(function (item) {

        var type = item.dataset.sound;

        soundList[type] = new Player(item);
    });
})(window, document);
