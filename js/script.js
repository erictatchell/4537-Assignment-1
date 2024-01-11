
class Button {
    constructor(color, width, height, top, left, order, handler) {
        this.btn = document.createElement("button");

        this.btn.style.backgroundColor = color;
        this.btn.style.width = width;
        this.btn.style.height = height;
        this.btn.style.margin = "10px";
        this.btn.style.position = "absolute";
        
        this.order = order;
        this.isClickable = false;

        this.setLocation(top, left);
        this.orgTop = top;
        this.orgLeft = left;

        document.body.appendChild(this.btn);

        // ChatGPT created this eventListener.
        this.btn.addEventListener('click', () => {
            if (typeof handler === 'function') {
                handler(this);
            }
        });
    }

    setLocation(top, left) {
        this.btn.style.top = top;
        this.btn.style.left = left;
    }
}

class Game {
    constructor(n, buttons, shuffles) {
        this.n = n;
        this.buttons = buttons;
        this.shuffles = shuffles;
        this.order = [];
        this.user_choices = [];

        // ChatGPT helped autocomplete
        for (let i = 1; i <= this.n; i++) {
            this.order.push(i);
        }
    }
    setButtons(buttons) {
        this.buttons = buttons;
    }
    setN(n) {
        this.n = n;
    }
    setShuffles(shuffles) {
        this.shuffles = shuffles;
    }


    start(n) {
        let left = 0;
        let top = 0;
        let chosen_colors = [];

        for (let i = 1; i <= n; i++) {
            // em is 10x the font size, 16
            // we don't want scrolling so we account for a whole button beforehand with +160
            if (left * 10 + 160 > window.innerWidth) {
                top += 6;
                left = 0;
            }

            let button = new Button(
                getColor(chosen_colors),
                "10em",
                "5em",
                top + "em",
                left * 10 + "px",
                i,
                this.handleClick.bind(this) // ChatGPT showed me .bind
            );
            left += 15; // good enough spacing 
            button.btn.innerHTML = i;
            this.buttons.push(button);
        }
    }

    defeat() {
        let heading = document.createElement('h1');
        heading.innerHTML = `${MESSAGES.correctOrder}`;
        let reset = document.createElement('input');
        reset.value = `${MESSAGES.retry}`;
        reset.type = 'submit'
        reset.addEventListener('click', this.reset);
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].isClickable = false;
            this.showOrder(this.buttons[i]);
            this.buttons[i].btn.style.position = "static";
            this.buttons[i].setLocation(this.buttons[i].orgTop, this.buttons[i].orgLeft);
        }

        document.body.appendChild(heading);
        document.body.appendChild(reset);
    }

    // ChatGPT suggested using a clickhandler
    handleClick(button) {
        if (button.isClickable) {
            this.showOrder(button);
            this.user_choices.push(button.order);
    
            // ChatGPT suggested this template checker for each time the user clicks
            // logic is mine
            setTimeout(() => {
                for (let i = 0; i < this.user_choices.length; i++) {
                    if (this.user_choices[i] !== this.order[i]) {
                        alert(`${MESSAGES.gameOver}`);
                        this.defeat();
                    }
                }

                if (this.user_choices.length === this.order.length) {
                    if (JSON.stringify(this.user_choices) === JSON.stringify(this.order)) {
                        alert(`${MESSAGES.win}`);
                        this.reset();
                    } else {
                        this.defeat();
                    }
                }
            }, 100);
        }   
    }

    reset() {
        document.body.innerHTML = '';
        menu();
    }

    hideOrder() {
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].btn.innerHTML = "";
            this.buttons[i].isClickable = true;
        }
    }

    showOrder(button) {
        button.btn.innerHTML = `${button.order}`;
    }

    shuffle(n, shuffles) {
        // ChatGPT helped turn (function() {}) into (() => {})
        let shuffling = setInterval(() => {
            for (let j = 0; j < n; j++) {
                let button = this.buttons[j];

                button.setLocation(
                    Math.floor(Math.random() * (window.innerHeight - 96)) + "px",
                    Math.floor(Math.random() * (window.innerWidth - 160)) + "px"
                );
            }

            // ChatGPT recommended using a shuffle counter and clearInterval. Code is mine.
            shuffles++;
            if (shuffles >= n) {
                clearInterval(shuffling);
                this.hideOrder();
            }
        }, 2000);
    }
}

// Only putting 7 colors, as per instruction:
// "...get a number, n, from user between 3 and 7..."
function getColor(chosen_colors) {
    let colors = ["red", "blue", "green", "yellow", "lightskyblue", "deeppink", "mediumpurple"];
    let choice = colors[Math.floor(Math.random() * colors.length)];

    // ChatGPT showed me the includes method, I initially tried the "in" keyword like in Python
    while (chosen_colors.includes(choice)) {
        choice = colors[Math.floor(Math.random() * colors.length)];
    }

    chosen_colors.push(choice);
    return choice;
}


function go() {
    document.getElementById("form").style.display = "none";
    let n = document.getElementById("n").value;
    let list = [];
    if (n < 3 || n > 7 || isNaN(n)) {
        alert(`${MESSAGES.limits}`);
        menu();
        return;
    }
    game = new Game(n, list, 0);

    game.start(n);

    setTimeout(function () {
        let shuffles = 0;
        game.shuffle(n, shuffles);
        game.setShuffles(shuffles);
    }, n * 1000);
}

document.addEventListener('DOMContentLoaded', function () {
    menu();
});

/*

    ChatGPT wrote this whole menu function, I gave it my hardcoded HTML as follows
    then told it to convert to a DOM function

*/
function menu() {
    document.body.innerHTML = '';
    let formDiv = document.createElement('div');
    formDiv.id = 'form';

    let heading = document.createElement('h1');
    heading.innerHTML = `${MESSAGES.howMany}`;

    let inputNumber = document.createElement('input');
    inputNumber.type = 'text';
    inputNumber.min = '3';
    inputNumber.max = '7';
    inputNumber.id = 'n';

    let submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.value = `${MESSAGES.go}`;
    submitButton.addEventListener('click', go);

    formDiv.appendChild(heading);
    formDiv.appendChild(inputNumber);
    formDiv.appendChild(submitButton);

    document.body.appendChild(formDiv);
}
