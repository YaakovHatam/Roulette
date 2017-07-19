    var canvas = this.__canvas = new fabric.StaticCanvas('c', {
        hoverCursor: 'pointer',
        selection: false,
        perPixelTargetFind: true,
        targetFindTolerance: 5
    });
    if (!isMobile) {
        canvas.setHeight(600);
        canvas.setWidth(600);
    }

    fabric.Object.prototype.originX = 'center';
    fabric.Object.prototype.originY = 'center';
    fabric.Object.prototypehasBorders = false;
    fabric.Object.prototype.hasControls = false;

    var app = {};
    app.height = canvas.getHeight();
    app.width = canvas.getWidth();
    app.AspectRatio = 2; //1:x
    app.NumbersSlotsHeight = 60;
    app.IsWorking = false;


    app.Wheel = {};
    app.Wheel.Duration = 8 * 1000;
    app.Wheel.Rounds = 22;
    app.Wheel.ImgSrc = 'images/wheel1200.png';
    app.Wheel.FirstSlot = 'green';
    app.Wheel.EventSlot = 'red';
    app.Wheel.OddtSlot = 'black';


    app.Ball = {};
    app.Ball.Radius = app.width/3.2;
    app.Ball.Rounds = function () { return app.Wheel.Rounds + 1 }; //to be random
    app.Ball.LastRound = false;
    app.Ball.CurrentRound = 0; //to be random
    app.Ball.rotationSpeedFactor = 0.5;
    app.Ball.Size = app.width/30;
    app.Ball.imgSrc = 'images/ball.png';
    app.Ball.BallObj;
    app.Ball.landingPosition = [3, 12, 22, 32, 42, 52, 61, 71, 81, 91, 100, 110, 120, 130, 139, 149, 159, 169, 178, 188, 198, 208, 218, 227, 237, 247, 257, 267, 276, 286, 296, 306, 315, 325, 335, 345, 354]; //TODO: make it dynamic


    app.Drink = {};
    app.Drink.DrinkObj = {};
    app.Drink.DrinkObj.image;
    app.Drink.DrinkObj.descr;
    app.Drink.types = [
        {
            src: 'images/drink2.jpg',
            descr: 'The only thing better than being helped up by James Bond is drinking this cocktail - a delightful combination of vodka shaken with some fresh espresso and coffee liqueur to give you the perfect pick-me-up.'
        },
        {
            src: 'images/drink1.jpg',
            descr: 'This delicious drink is a blend of vodka with a splash of Cointreau and a dash of orange juice. Shaken together and topped with sparkling wine to give it some bubbles and take you to a place that only Mr Bond could be.'
        }
    ];


    app.Sound = {};
    app.Sound.isOn = true;
    app.Sound.SoundObj = document.getElementById('rouletteSound');
    app.ChoosenNumIndex;

    var TrianglesGroup = new fabric.Group(null, { left: app.width / 2, top: app.height / 2 });
    var RouletteNumbersGroup = new fabric.Group(null, { left: app.width / 2, top: app.height / 2 });
    var circleDegrees = 360;
    var RoundsPerSecond = 2;
    var RouletteNumbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    var TrianglesNum = RouletteNumbers.length;

    function BreakTextToLines(text, maxCharsLengthPerLine) {

        var words = text.split(' ');

        var NewText = '';
        var CharsCounter = 0;
        for (i = 0; i < words.length ; i++)
        {
            NewText += words[i] += ' ';
            CharsCounter += words[i].length;
            if (CharsCounter > maxCharsLengthPerLine) {
                NewText += "\n";
                CharsCounter = 0;
            }
        }
        return NewText;
    }

    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    function RadiansToDegress(rad) {
        return rad * Math.PI / 180;
    }

    function CalcuatePoint(CircleElements, radius, iterator) {
        var divider = circleDegrees / CircleElements;
        var angle = divider * iterator;
        return new Point(radius * Math.cos(RadiansToDegress(angle)), radius * Math.sin(RadiansToDegress(angle)));
    }


        for (i = 0; i < TrianglesNum; i++) {
            RouletteNumbersGroup.add(new fabric.Text(RouletteNumbers[i].toString(), {
                angle: -(circleDegrees / TrianglesNum) * i,
                top: (CalcuatePoint(TrianglesNum, app.width / 4 , i).x),
                left: (CalcuatePoint(TrianglesNum, app.width / 4 , i).y),
                fill: 'white',
                fontSize: app.width/30
            }));

            TrianglesGroup.add(new fabric.Triangle({
                angle: (circleDegrees / TrianglesNum) * i,
                width: app.height / (6.5 * app.AspectRatio),
                height: app.height / app.AspectRatio - 2,
                originY: 'top',
                fill: (i == 0 ? app.Wheel.FirstSlot : (i % 2 == 0 ? app.Wheel.EventSlot : app.Wheel.OddtSlot))
            }));

        }
        var group = new fabric.Group([TrianglesGroup, RouletteNumbersGroup], {
            left: app.width / 2,
            top: app.height / 2
        });

        fabric.Image.fromURL('images/bg1200.png', function (oImg) {
            canvas.add(oImg);
            canvas.centerObject(oImg);
            canvas.renderAll();

            /* wheel */
            fabric.Image.fromURL(app.Wheel.ImgSrc, function (oImg) {
                group.add(oImg);
                canvas.add(group);
                canvas.renderAll();
            }, {
                width: app.width,
                height: app.height,
            });
            /* end wheel */

        }, {
            width: app.width,
            height: app.height,
        });

    function animateWheel() {
        group.animate('angle', "+=" + (circleDegrees * app.Wheel.Rounds).toString(), {
            duration: app.Wheel.Duration,
            onChange: canvas.renderAll.bind(canvas),
            easing: fabric.util.ease.easeInOutCubic,
            onComplete: function () { app.Ball.LastRound = true; }
        });
    }

    function StartBall() {
        if (typeof app.Ball.BallObj === 'undefined') {
            fabric.Image.fromURL(app.Ball.imgSrc, function (ballImg) {
                app.Ball.BallObj = ballImg;
                canvas.add(app.Ball.BallObj);
                canvas.renderAll();
                animatePlanet(app.Ball.BallObj);
            }, {
                width: app.Ball.Size,
                height: app.Ball.Size,
                index: 0,
                left: (canvas.getWidth() / 2) - 90,
                top: canvas.getHeight() / 2
            });
        }
        else {
            canvas.add(app.Ball.BallObj);
            canvas.renderAll();
            animatePlanet(app.Ball.BallObj);
        }


        function animatePlanet(oImg) {
            var cx = canvas.getWidth() / 2,
            cy = canvas.getHeight() / 2;


            var rand = fabric.util.getRandomInt(0, (TrianglesNum - 1));

            var _p = CalcuatePoint(TrianglesNum, app.height / 2 - 150, rand);
            _p.x += cx;
            _p.y += cy;

            var angx = app.Ball.landingPosition[Math.floor(Math.random()*app.Ball.landingPosition.length)];

            startAngle = angx ,
            endAngle = angx + 359;
            console.log(angx);
            (function animate() {
                if (app.Ball.LastRound) {
                    app.Ball.CurrentRound = 0;
                    app.ChoosenNumIndex = rand;
                    EndOfWheel();
                    return;
                } else app.Ball.CurrentRound++;

                fabric.util.animate({
                    startValue: startAngle,
                    endValue: endAngle,
                    duration: app.Ball.rotationSpeedFactor * 1000 * app.Ball.CurrentRound,

                    // linear movement
                    easing: function (t, b, c, d) { return c * t / d + b; },

                    onChange: function (angle) {
                        angle = fabric.util.degreesToRadians(angle);

                        var x = cx + app.Ball.Radius * Math.cos(angle);
                        var y = cy + app.Ball.Radius * Math.sin(angle);

                        oImg.set({ left: x, top: y }).setCoords();

                        canvas.renderAll();
                    },
                    onComplete: animate
                });
            })();
        }
    };

    function EndOfWheel() {
        /*
        fabric.Image.fromURL(app.Drink.types[app.ChoosenNumIndex%2].src, function (oImg) {
            app.Drink.DrinkObj.image = oImg;
            canvas.add(oImg);
            canvas.centerObjectH(oImg);

            app.Drink.DrinkObj.descr = new fabric.Text(BreakTextToLines(app.Drink.types[app.ChoosenNumIndex % 2].descr, 30), {
                fill: 'white',
                fontSize: 20
            });
            canvas.centerObject(app.Drink.DrinkObj.descr);
            canvas.add(app.Drink.DrinkObj.descr);

            canvas.renderAll();
            $('#numChosen').text(RouletteNumbers[app.ChoosenNumIndex]);
            if (app.Sound.isOn)
                app.Sound.SoundObj.pause();
        }, {
            top: app.height / 4,
            width: 100,
            height: 100,
        });
        */

        app.IsWorking = false;
        app.Ball.LastRound = false;
        app.Ball.CurrentRound = 0;
    }


    function Start() {
        if (app.IsWorking) //mutex
            return;

        app.IsWorking = true;
        canvas.remove(app.Ball.BallObj);
        canvas.remove(app.Drink.DrinkObj.image);
        canvas.remove(app.Drink.DrinkObj.descr);

        if (app.Sound.isOn) {
            app.Sound.SoundObj.currentTime = 0;
            app.Sound.SoundObj.play();
        }

        app.Wheel.Rounds = fabric.util.getRandomInt(12, 19);

        animateWheel();

        setTimeout(function () {
            StartBall();
        }, 2000);
    }

    //RegisterEvents
    (function () {
        var _c = document.getElementById('c');
        // create a simple instance
        // by default, it only adds horizontal recognizers
        var mc = new Hammer(_c);
        mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        // listen to events...
        mc.on("pandown", function (ev) { //tap press
            switch (ev.type) {
                case 'pandown':
                    Start();
                    break;
            }
        });
    })();
