var Graphics = function(initialCX=0.0, initialCY=0.0, initialViewSize=6.0, events=true) {
    // Window functions

    this.onMouseMove = function(event) {
        this.mouseX = this.revTransX(event.clientX);
        this.mouseY = this.revTransY(event.clientY);
        if (this.updateOnMouseMove) {
            this.update();
        }
    }

    this.onMouseWheel = function(event) {
        if (event.wheelDelta < 0) {
            this.viewSize *= 2;
        }
        else {
            this.viewSize *= .5;            
        }
        this.update();
    }

    this.onKeyDown = function(event) {
        if (event.code == "ArrowRight") {
            this.centerX += this.viewSize/3;
            this.update();
        }
        else if (event.code == "ArrowLeft") {
            this.centerX -= this.viewSize/3;            
            this.update();
        }
        else if (event.code == "ArrowUp") {
            this.centerY += this.viewSize/3;
            this.update();            
        }
        else if (event.code == "ArrowDown") {
            this.centerY -= this.viewSize/3;           
            this.update();
        }
    }

    this.onResize = function() {
        this.update();
    }
    
    this.update = function() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.updateFunction !== undefined) {
            this.updateFunction.bind(null, this, this.mouseX, this.mouseY)();
        }
    }
    
    this.setUpdateFunction = function(f, updateOnMouseMove=false) {
        this.updateFunction = f;
        this.update();
        this.updateOnMouseMove = updateOnMouseMove;
    }
    
    this.getWidth = function() {
        return this.canvas.width;
    }

    this.getHeight = function() {
        return this.canvas.height;
    }

    this.rgb = function(r, g, b) {
        return "rgb(" + Math.floor(r) + "," + Math.floor(g) + "," + Math.floor(b) + ")";
    }



    this.setViewWindow = function(cx, cy, s) {
        this.centerX = cx;
        this.centerY = cy;
        this.viewSize = s;
    }

    this.transX = function(x) {
        var newX = (x - this.centerX) * (1 / this.viewSize) * 0.5;
        return this.getWidth() / 2 + newX * this.getWidth();
    }

    this.revTransX = function(x) {
        var lastX = (x - this.getWidth() / 2) / this.getWidth();
        return lastX * 2 * this.viewSize + this.centerX
    }

    this.transY = function(y) {
        var newY = - (y - this.centerY) * (1 / this.viewSize) * 0.5;
        return this.getHeight() / 2 + newY * this.getWidth();
    }

    this.revTransY = function(y) {
        var lastY = (y - this.getHeight() / 2) / this.getWidth();
        return - lastY * 2 * this.viewSize + this.centerY;
    }

    this.transW = function(w) {
        return w * (1 / this.viewSize) * 0.5 * this.getWidth();
    }
    
    this.transH = function(h) {
        return - h * (1 / this.viewSize) * 0.5 * this.getWidth();
    }

    // Graphics functions

    this.drawAxes = function(color="#444444") {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(this.transX(this.centerX - this.viewSize) - 1, this.transY(0.0), this.getWidth(), 2);
        this.ctx.fillRect(this.transX(0), this.transY(this.centerY + this.viewSize) - 1, 2, this.getHeight()*3);
    }

    this.fillBackground = function(color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    this.mapFunction = function(f) {
        for (var x = 0; x < this.getWidth(); x++) {
            for (var y = 0; y < this.getHeight(); y++) {
                this.ctx.fillStyle = f(this.revTransX(x), this.revTransY(y));
                this.ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    this.plotFunction = function(f, color="#000000") {
        this.ctx.fillStyle = color;
        for (var x = this.revTransX(0); x < this.revTransX(this.getWidth()); x += this.viewSize/(this.getWidth()*2)) {
            this.ctx.fillRect(this.transX(x), this.transY(f(x)), 1, 1);
        }
    }
    
    this.drawGrid = function(size, color="#b5b5b5", label=true, fontsize=16) {
        this.ctx.font = fontsize + "px Sans-Serif";
        var fx = this.revTransX(0);
        fx = fx - fx % size;
        do {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(this.transX(fx), 0, 1, this.getHeight());
            if (label) {
                this.ctx.fillStyle = "#333333";
                this.ctx.fillText("" + fx, this.transX(fx) + 5, this.transY(0) - 5);
            }
            fx += size;
        }
        while (fx < this.revTransX(this.getWidth()))
        
        var fy = this.revTransY(0);
        fy = fy - fy % size;
        do {
            this.ctx.fillStyle = color;            
            this.ctx.fillRect(0, this.transY(fy), this.getWidth(), 1);
            if (label) {
                this.ctx.fillStyle = "#333333";
                if (fy != 0) {
                    this.ctx.fillText("" + fy, this.transX(0) + 5, this.transY(fy) + 5);
                }
            }
            fy -= size;
        }
        while (fy > this.revTransY(this.getHeight()))
    }
    
    this.drawLine = function(x1, y1, x2, y2, color="#000000", size=1) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = size;
        this.ctx.beginPath();
        this.ctx.moveTo(this.transX(x1), this.transY(y1));
        this.ctx.lineTo(this.transX(x2), this.transY(y2));
        this.ctx.stroke();
    }

    this.drawLineFrom = function(x1, y1, x2, y2, color="#000000", size=1) {
        this.ctx.lineWidth = size;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(this.transX(x1), this.transY(y1));
        var dx = x2 - x1;
        var dy = y2 - y1;
        var length = Math.sqrt(dx*dx + dy*dy);
        dx = dx / length;
        dy = dy / length;
        x2 = x1 + dx * this.viewSize * 2;
        y2 = y1 + dy * this.viewSize * 2;
        this.ctx.lineTo(this.transX(x2), this.transY(y2));
        this.ctx.stroke();
    }

    this.drawLineThrough = function(x1, y1, x2, y2, color="#000000", size=1) {
        this.ctx.lineWidth = size;
        this.ctx.strokeStyle = color;
        var dx = x2 - x1;
        var dy = y2 - y1;
        var length = Math.sqrt(dx*dx + dy*dy);
        dx = dx / length;
        dy = dy / length;
        x2 = x1 + dx * this.viewSize * 2;
        y2 = y1 + dy * this.viewSize * 2;
        var x3 = x1 - dx * this.viewSize * 2;
        var y3 = y1 - dy * this.viewSize * 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.transX(x3), this.transY(y3));
        this.ctx.lineTo(this.transX(x1), this.transY(y1));
        this.ctx.lineTo(this.transX(x2), this.transY(y2));
        this.ctx.stroke();
    }

    this.fillRect = function(x, y, w, h, color="#000000") {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(this.transX(x), this.transY(y), this.transW(w), this.transH(h));
    }
    
    this.drawCircle = function(cx, cy, r, color="#000000", linesize=1) {
        this.ctx.beginPath();
        this.ctx.arc(this.transX(cx), this.transY(cy), this.transW(r), 0, 2*Math.PI, false);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = linesize;
        this.ctx.stroke();
    }

    this.fillCircle = function(cx, cy, r, color="#000000") {
        this.ctx.beginPath();
        this.ctx.arc(this.transX(cx), this.transY(cy), this.transW(r), 0, 2*Math.PI, false);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }

    this.fillDot = function(cx, cy, color="#000000", r=5) {
        this.ctx.beginPath();
        this.ctx.arc(this.transX(cx), this.transY(cy), r, 0, 2*Math.PI, false);
        this.ctx.fillStyle = color;
        this.ctx.fill();    
    }
    
    this.drawMarker = function(x, y, color="#ff0000", size=3, thickness=1) {
        var rx = this.transX(x);
        var ry = this.transY(y);
        this.ctx.lineWidth = thickness;
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(rx - size, ry);
        this.ctx.lineTo(rx + size, ry);
        this.ctx.stroke();
        this.ctx.moveTo(rx, ry - size);
        this.ctx.lineTo(rx, ry + size);
        this.ctx.stroke();
    }

    // Initialization

    this.updateFunction = undefined;
    this.centerX = initialCX;
    this.centerY = initialCY;
    this.viewSize = initialViewSize;

    this.mouseX = 0.0;
    this.mouseY = 0.0;
    this.updateOnMouseMove = false;

    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.pageStyleString = "";
    this.pageStyleString += "html, body {";
    this.pageStyleString += "    width: 100%;";
    this.pageStyleString += "    height: 100%;";
    this.pageStyleString += "    margin: 0px;";
    this.pageStyleString += "    border: 0;";
    this.pageStyleString += "    overflow: hidden;";
    this.pageStyleString += "    display: block;";
    this.pageStyleString += "}";
    this.pageStyle = document.createElement('style')
    this.pageStyle.type = "text/css";
    this.pageStyle.innerHTML = this.pageStyleString;
    document.getElementsByTagName("head")[0].appendChild(this.pageStyle);
    this.ctx = this.canvas.getContext("2d");
    this.update();

    if (events) {
        window.addEventListener("resize", this.onResize.bind(this), false);
        document.addEventListener("keydown", this.onKeyDown.bind(this), false);
        document.addEventListener("mousewheel", this.onMouseWheel.bind(this), false);
        document.addEventListener("mousemove", this.onMouseMove.bind(this), false);
    }
}