const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");
const halfFloatExt = gl.getExtension("OES_texture_half_float");
gl.getExtension("OES_texture_float");
const imgSize = 256;
function createData(format) {
    const count = imgSize * imgSize * 4;
    switch (format) {
        default:
        case gl.UNSIGNED_BYTE:
            return new Uint8Array(count);
        case halfFloatExt.HALF_FLOAT_OES:
            return new Uint16Array(count);
        case gl.FLOAT:
            return new Float32Array(count);
    }
}
function test(format) {
    const orig = createData(format);
    orig.fill(128);
    function createTexture() {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imgSize, imgSize, 0, gl.RGBA, format, orig);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return tex;
    }
    function createFramebuffer(texture) {
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return fb;
    }
    const tex1 = createTexture();
    const tex2 = createTexture();
    const fb1 = createFramebuffer(tex1);
    const fb2 = createFramebuffer(tex1);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb1);
    gl.bindTexture(gl.TEXTURE_2D, tex2);
    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, imgSize, imgSize);
    const copied = createData(format);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb2);
    gl.readPixels(0, 0, imgSize, imgSize, gl.RGBA, format, copied);
    function check() {
        for (let i = 0; i < imgSize * imgSize; ++i) {
            if (orig[i] != copied[i]) {
                console.error("wrong data!", orig[i], copied[i]);
                return;
            }
        }
        console.log("correct!");
    }
    check();
}
test(halfFloatExt.HALF_FLOAT_OES);
