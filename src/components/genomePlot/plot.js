class Plot {
  constructor(regl) {
    this.regl = regl;
    this.positions = [[0.5, 0.0], [0.0, 0.5], [1.0,0.5], [1.0, -0.5], [0.0, -0.5],[0.0, 0.5]];
    this.rectangleHeight = 10.0;
    this.strokeWidth = 0.66;
    this.commonSpecIntervals = {
      frag: `
      precision highp float;
      varying vec4 vColor;
      void main() {
        gl_FragColor = vColor;
      }`,

      vert: `
      precision highp float;
      attribute vec2 position;
      attribute float startPoint, endPoint, valY, color;
      uniform vec2 domainX, domainY;
      varying vec4 vColor;
      uniform float stageWidth, stageHeight, rectangleHeight, offset;

      vec2 normalizeCoords(vec2 position) {
        // read in the positions into x and y vars
        float x = position[0];
        float y = position[1];

        return vec2(
          2.0 * ((x / stageWidth) - 0.5),
          -(2.0 * ((y / stageHeight) - 0.5)));
      }

      void main() {
        float kx = stageWidth / (domainX.y - domainX.x);
        float ky = -stageHeight / (domainY.y - domainY.x);

        float pos1X = kx * (startPoint - domainX.x);
        float pos2X = kx * (endPoint - domainX.x);
        float posY = stageHeight + ky * (valY - domainY.x);

        float padding = offset;
        float diff = pos2X - pos1X - 2.0 * padding;
        if (diff < 0.5) {
          padding = 0.0;
        }

        float vecX = max(pos2X - pos1X - 2.0 * padding, 0.5) * position.x + pos1X + padding;
        float vecY = (rectangleHeight - 2.0 * padding) * position.y + posY;

        vec2 v = normalizeCoords(vec2(vecX,vecY));

        gl_Position = vec4(v, 0, 1);
        // vColor = vec4(color.r / 255.0, color.g / 255.0, color.b / 255.0, color.a / 1.0);
        float red = floor(color / 65536.0);
        float green = floor((color - red * 65536.0) / 256.0);
        float blue = color - red * 65536.0 - green * 256.0;
        vColor = vec4(red / 255.0, green / 255.0, blue / 255.0, 1.0);
      }`,

      attributes: {
        position: this.positions,

        startPoint: {
          buffer: regl.prop("startPoint"),
          divisor: 1,
        },

        endPoint: {
          buffer: regl.prop("endPoint"),
          divisor: 1,
        },

        valY: {
          buffer: regl.prop("valY"),
          divisor: 1,
        },

        color: {
          buffer: regl.prop("color"),
          divisor: 1,
        },
      },

      primitive: "triangle fan",

      depth: {
        enable: false,
      },

      uniforms: {
        stageWidth: regl.prop("stageWidth"),
        stageHeight: regl.prop("stageHeight"),
        rectangleHeight: this.rectangleHeight,
        offset: regl.prop("offset"),
        domainX: regl.prop("domainX"),
        domainY: regl.prop("domainY"),
      },

      count: this.positions.length,
      instances: regl.prop("instances"),
    };
    this.draw = regl(this.commonSpecIntervals);
  }

  load(
    width,
    height,
    intervalStruct
  ) {
    const {intervalsStartPoint, intervalsEndPoint, intervalsY, intervalsFill, intervalsStroke, domainX, domainY} = intervalStruct;
    const startPoint = this.regl.buffer(intervalsStartPoint);
    const endPoint = this.regl.buffer(intervalsEndPoint);
    const fill = this.regl.buffer(intervalsFill);
    const stroke = this.regl.buffer(intervalsStroke);
    const valY = this.regl.buffer(intervalsY);
    const instances = intervalsStartPoint.length;
    const stageWidth = width;
    const stageHeight = height;
    let color = stroke;
    let offset = 0;
    this.dataBufferStroke = {stageWidth, stageHeight, startPoint, endPoint, color, offset, valY, domainX, domainY, instances};
    color = fill;
    offset = this.strokeWidth;
    this.dataBufferFill = {stageWidth, stageHeight, startPoint, endPoint, color, offset, valY, domainX, domainY, instances};
    color = this.regl.buffer(intervalsStroke.map((d,i) => i + 3000));
    offset = 0;
    this.fboIntervals = this.regl.framebuffer({
      width: stageWidth,
      height: stageHeight,
      colorFormat: 'rgba',
    });
    this.drawFboIntervals = this.regl({...this.commonSpecIntervals, framebuffer: this.fboIntervals});
    this.dataBufferFboIntervals = {stageWidth, stageHeight, startPoint, endPoint, color, offset, valY, domainX, domainY, instances};
  }

  rescaleXY(domainX, domainY) {
    this.dataBufferStroke.domainX = domainX;
    this.dataBufferFill.domainX = domainX;
    this.dataBufferStroke.domainY = domainY;
    this.dataBufferFill.domainY = domainY;
    this.fboIntervals = this.regl.framebuffer({
      width: this.dataBufferFboIntervals.stageWidth,
      height: this.dataBufferFboIntervals.stageHeight,
      colorFormat: 'rgba',
    });
    this.drawFboIntervals = this.regl({...this.commonSpecIntervals, framebuffer: this.fboIntervals});
    this.dataBufferFboIntervals.domainX = domainX;
    this.dataBufferFboIntervals.domainY = domainY;
    this.render();
  }

  render() {
    this.draw(this.dataBufferStroke);
    this.draw(this.dataBufferFill);
    this.drawFboIntervals(this.dataBufferFboIntervals);
  }
}

export default Plot;
