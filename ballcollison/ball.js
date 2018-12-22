class Shape {
    constructor(px,py,pz = 0,option ={}){
        this.px = px;
        this.py = py;
        this.pz = pz;
        this.radius = option.radius || 25;
        this.vx = option.vx||0;
        this.vy = option.vy||0;
        this.vz = option.vz||0;
        this.color = option.color||'orange';
    }
    move(){
        this.px +=this.vx;
        this.py +=this.vy;
        this.pz += this.vz;
    }
    draw(container){
        container.restrain(this);
        const ctx = container.offscreenContext;
        const ratio = -0.2*this.pz/container.depth+1;
        // console.info(ratio,this.pz);
        const px = container.width/2 + ratio*(this.px-container.width/2);
        const py = container.height/2 + ratio*(this.py-container.height/2);
        ctx.beginPath();
        ctx.arc(px, py, this.radius*ratio, 0, Math.PI * 2, true);
        ctx.closePath();
        // ctx.fillStyle = this.color;

        const radgrad = ctx.createRadialGradient(px,py,0.8*this.radius*ratio,px,py,this.radius*ratio);
        radgrad.addColorStop(0, this.color);
        radgrad.addColorStop(1, 'rgba(228,199,0,0)');
        ctx.fillStyle = radgrad;
        ctx.fill();
        this.move();
    }
    collision(shape){
        let [dx,dy,dz]=[this.px-shape.px,this.py-shape.py,this.pz-shape.pz];
        const distance = Math.hypot(dx,dy,dz);
        if(distance<2*this.radius){
            // debugger;
            const vx1=this.vx;
            const vy1=this.vy;
            const vz1=this.vz;
            const vx2=shape.vx;
            const vy2=shape.vy;
            const vz2=shape.vz;
            //发生碰撞后的时间
            const t = (2*this.radius-distance)/Math.hypot(vx1-vx2,vy1-vy2,vz1-vz2);
            //把球的位置还原到碰撞时
            this.px-=vx1*t;
            this.py-=vy1*t;
            this.pz-=vz1*t;
            shape.px-=vx2*t;
            shape.py-=vy2*t;
            shape.pz-=vz2*t;
            dx=this.px-shape.px;
            dy=this.py-shape.py;
            dz=this.pz-shape.pz;
            const k = ((vx1-vx2)*dx+(vy1-vy2)*dy+(vz1-vz2)*dz)/(Math.pow(dx,2)+Math.pow(dy,2)+Math.pow(dz,2));
            //碰撞后的速度
            this.vx=vx1-k*dx;
            this.vy=vy1-k*dy;
            this.vz=vz1-k*dz;
            shape.vx=vx2+k*dx;
            shape.vy=vy2+k*dy;
            shape.vz=vz2+k*dz;
            //碰撞后t时间，球的位置
            this.px=Math.floor(this.px+this.vx*t);
            this.py=Math.floor(this.py+this.vy*t);
            this.pz=Math.floor(this.pz+this.vz*t);
            shape.px=Math.floor(shape.px+shape.vx*t);
            shape.py=Math.floor(shape.py+shape.vy*t);
            shape.pz=Math.floor(shape.pz+shape.vz*t);
        }
    }
}

class Container {
    constructor(width,height,depth){
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.offscreenCanvas = document.createElement("canvas");
        this.offscreenCanvas.width = this.width;
        this.offscreenCanvas.height = this.height;
        this.offscreenContext = this.offscreenCanvas.getContext("2d");
    }
    clearOld(ctx){
        ctx.clearRect(0,0,this.width,this.height);
    }
    restrain(shape){
        if (shape.py + shape.vy + shape.radius > this.height || shape.py + shape.vy < shape.radius) {
            shape.vy = -shape.vy;
        }
        if (shape.px + shape.vx + shape.radius > this.width || shape.px + shape.vx < shape.radius) {
            shape.vx = -shape.vx;
        }
        if (shape.pz + shape.vz + shape.radius > this.depth || shape.pz + shape.vz < shape.radius) {
            shape.vz = -shape.vz;
        }
    }
}
class Box extends Container{
    constructor(id){
        const canvas = document.getElementById(id);
        super(canvas.width,canvas.height,canvas.height);
        this.ctx = canvas.getContext('2d');
    }
    init(){
        this.ctx.beginPath();
        // this.ctx.translate(this.width/2, this.height/2);
        // this.ctx.save();

        // const trapezoid = ()=> {
        //     const lingrad = this.ctx.createLinearGradient(0,-this.height/2,0,0);
        //     lingrad.addColorStop(0, '#eee');
        //     lingrad.addColorStop(0.8, '#666');
        //     lingrad.addColorStop(1, '#888');
        //     this.ctx.fillStyle = lingrad;
        //     this.ctx.lineTo(-this.width/2,-this.height/2);
        //     this.ctx.lineTo(this.width,0);
        //     // this.ctx.lineTo(0,0);
        // }
        // trapezoid();
        // this.ctx.fill();
        // this.ctx.restore();

        // this.ctx.save();
        // this.ctx.rotate(Math.PI/2);
        // this.ctx.scale(this.height/this.width,1);
        // trapezoid();
        // this.ctx.fill();

        this.ctx.rect(0, 0, this.width, this.height)

        this.ctx.moveTo(0, 0)
        this.ctx.lineTo(0.1*this.width, 0.1*this.height)

        this.ctx.moveTo(this.width, 0)
        this.ctx.lineTo(0.9*this.width, 0.1*this.height)

        this.ctx.moveTo(this.width, this.height)
        this.ctx.lineTo(0.9*this.width, 0.9*this.height)

        this.ctx.moveTo(0, this.height)
        this.ctx.lineTo(0.1*this.width, 0.9*this.height)

        this.ctx.rect(0.1*this.width,0.1*this.height, 0.8*this.width, 0.8*this.height);

        this.ctx.stroke();
    }
    render(){
        this.clearOld(this.ctx);
        this.init();
        this.ctx.drawImage(this.offscreenCanvas,0,0);
    }
}
export {Shape,Box}