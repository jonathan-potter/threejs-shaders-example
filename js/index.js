/* globals THREE */

const fragmentShader = `
#include <common>

uniform vec3 iResolution;
uniform float iTime;
uniform sampler2D iChannel0;

// By Daedelus: https://www.shadertoy.com/user/Daedelus
// license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
#define TIMESCALE 0.25
#define TILES 18.0
#define COLOR 0.7, 1.6, 2.8

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
	vec2 uv = fragCoord.xy / iResolution.xy;
	uv.x *= iResolution.x / iResolution.y;

	vec4 noise = texture2D(iChannel0, floor(uv * TILES) / TILES);
	float p = 1.0 - mod(noise.r + noise.g + noise.b + iTime * float(TIMESCALE), 1.0);
	p = min(max(p * 3.0 - 1.8, 0.1), 2.0);

	vec2 r = mod(uv * TILES, 1.0);
	r = vec2(pow(r.x - 0.5, 2.0), pow(r.y - 0.5, 2.0));
    p *= 1.0 - pow(min(1.0, 12.0 * dot(r, r)), 2.0);
    // float p = texture2D(iChannel0, floor(uv * TILES) / TILES).x;

	fragColor = vec4(COLOR, 1.0) * p;
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
  }
`
const loader = new THREE.TextureLoader()
const texture = loader.load('assets/noise.png')
texture.minFilter = THREE.NearestFilter
texture.magFilter = THREE.NearestFilter
texture.wrapS = THREE.RepeatWrapping
texture.wrapT = THREE.RepeatWrapping
const uniforms = {
    iTime: { value: 0 },
    iResolution:  { value: new THREE.Vector3() },
    iChannel0: { value: texture },
}

function main () {
    const canvas = document.querySelector('#canvas')
    const renderer = new THREE.WebGLRenderer({canvas})
    renderer.autoClearColor = false

    /* eslint-disable indent */
    const camera = new THREE.OrthographicCamera(
        -1, // left
         1, // right
         1, // top
        -1, // bottom
        -1, // near,
         1, // far
    )
    /* eslint-enable indent */

    const scene = new THREE.Scene()
    const plane = new THREE.PlaneBufferGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
        fragmentShader,
        uniforms,
    })
    scene.add(new THREE.Mesh(plane, material))

    function resizeRendererToDisplaySize (renderer) {
        const canvas = renderer.domElement
        const width = canvas.clientWidth
        const height = canvas.clientHeight
        const needResize = canvas.width !== width || canvas.height !== height
        if (needResize) {
            renderer.setSize(width, height, false)
        }
        return needResize
    }

    function render ( time ) {
        time *= 0.001 // seconds

        resizeRendererToDisplaySize(renderer)

        const canvas = renderer.domElement
        uniforms.iResolution.value.set(canvas.width, canvas.height, 1)
        uniforms.iTime.value = time

        renderer.render(scene, camera)

        requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
}

main()
