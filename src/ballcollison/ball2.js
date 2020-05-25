class Shape {
    constructor(position = [50,50,50],velocity = [0,0,0],options={},radius=25){
        this.position = position;
        this.velocity = velocity;
        this.radius = radius || 25;
        this.color = options.color||'orange';
    }
    move(){
        for(let i=0;i<3;i++){
            this.position[i]+=this.velocity[i];
        }
    }
    draw(container){
        container.restrain(this);
        const ctx = container.offscreenContext;
        const ratio = -0.2*this.position[2]/container.depth+1;
        // console.info(ratio,this.pz);
        const px = container.width/2 + ratio*(this.position[0]-container.width/2);
        const py = container.height/2 + ratio*(this.position[1]-container.height/2);
        ctx.beginPath();
        ctx.arc(px, py, this.radius*ratio, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = this.color;
        const radgrad = ctx.createRadialGradient(px,py,0.8*this.radius*ratio,px,py,this.radius*ratio);
        radgrad.addColorStop(0, this.color);
        radgrad.addColorStop(1, 'rgba(228,199,0,0)');
        ctx.fillStyle = radgrad;
        ctx.fill();
        this.move();
    }
    collision(shape){
        let [dx,dy,dz] =shape.position.map(
            (value,index)=>this.position[index]-value
        );
        const distance = Math.hypot(dx,dy,dz);
        if(distance<2*this.radius){
            // debugger;
            const [vx1,vy1,vz1]=this.velocity;
            const [vx2,vy2,vz2]=shape.velocity;
            //发生碰撞后的时间
            const t = (this.radius*2 -distance)/Math.hypot(vx1-vx2,vy1-vy2,vz1-vz2);
            //把球的位置还原到碰撞时
            this.position.forEach(
                (value, index, array) => array[index] = value - this.velocity[index]*t
            );
            shape.position.forEach(
                (value, index, array) => array[index] = value - shape.velocity[index]*t
            );
            const positionVector = shape.position.map(
                (value,index)=>this.position[index]-value
            )
            const k = ((vx1-vx2)*dx+(vy1-vy2)*dy+(vz1-vz2)*dz)/(Math.pow(dx,2)+Math.pow(dy,2)+Math.pow(dz,2));
            //碰撞后的速度
            this.velocity.forEach(
                (value, index, array) => array[index] = value - positionVector[index]*k
            );
            shape.velocity.forEach(
                (value, index, array) => array[index] = value + positionVector[index]*k
            );
            //碰撞后t时间，球的位置
            this.position.forEach(
                (value, index, array) => array[index] = Math.floor(value + this.velocity[index]*t)
            )
            shape.position.forEach(
                (value, index, array) => array[index] = Math.floor(value + shape.velocity[index]*t)
            )
        }
    }
}

class Container {
    constructor(scale = [0,0,0]){
        this.scale = scale;
        this.offscreenCanvas = document.createElement("canvas");
        this.offscreenCanvas.width = this.scale[0];
        this.offscreenCanvas.height = this.scale[1];
        this.offscreenContext = this.offscreenCanvas.getContext("2d");
    }
    clearOld(ctx){
        ctx.clearRect(0,0,this.offscreenCanvas.width,this.offscreenCanvas.height);
    }
    restrain(shape){
        for(let i = 0,len = shape.position.length;i<len;i++){
            if (shape.position[i] + shape.velocity[i] + shape.radius > this.scale[i] || shape.position[i] + shape.velocity[i] < shape.radius) {
                shape.velocity[i] = -shape.velocity[i];
            }
        }
    }
}
class Box extends Container{
    constructor(id){
        const canvas = document.getElementById(id);
        super([canvas.width,canvas.height,canvas.height]);
        this.ctx = canvas.getContext('2d');
    }
    init(){
        this.ctx.beginPath();

        this.ctx.rect(0, 0, this.scale[0], this.scale[1])

        this.ctx.moveTo(0, 0)
        this.ctx.lineTo(0.1*this.scale[0], 0.1*this.scale[1])

        this.ctx.moveTo(this.scale[0], 0)
        this.ctx.lineTo(0.9*this.scale[0], 0.1*this.scale[1])

        this.ctx.moveTo(this.scale[0], this.scale[1])
        this.ctx.lineTo(0.9*this.scale[0], 0.9*this.scale[1])

        this.ctx.moveTo(0, this.scale[1])
        this.ctx.lineTo(0.1*this.scale[0], 0.9*this.scale[1])

        this.ctx.rect(0.1*this.scale[0],0.1*this.scale[1], 0.8*this.scale[0], 0.8*this.scale[1]);

        this.ctx.stroke();
    }
    render(){
        this.clearOld(this.ctx);
        this.init();
        this.ctx.drawImage(this.offscreenCanvas,0,0);
    }
}
export {Shape,Box}