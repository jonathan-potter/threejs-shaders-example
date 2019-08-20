/* globals THREE */

const fragmentShader = `
#include <common>

uniform vec3 iResolution;
uniform float iTime;
uniform sampler2D iChannel0;

// By Daedelus: https://www.shadertoy.com/user/Daedelus
// license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
#define TIMESCALE 0.25
#define TILES 8.0
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

varying vec2 vUv;

void main() {
    mainImage(gl_FragColor, vUv * iResolution.xy);
  }
`

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
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
    iResolution:  { value: new THREE.Vector3(1, 1, 1) },
    iChannel0: { value: texture },
}

function main () {
    const canvas = document.querySelector('#canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const renderer = new THREE.WebGLRenderer({canvas})
    renderer.autoClearColor = false

    const fov = 75
    const aspect = 2  // the canvas default
    const near = 0.1
    const far = 5
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.position.z = 2

    const scene = new THREE.Scene()


    {
        const color = 0xFFFFFF
        const intensity = 1
        const light = new THREE.DirectionalLight(color, intensity)
        light.position.set(-1, 2, 4)
        scene.add(light)
    }

    const boxWidth = 1
    const boxHeight = 1
    const boxDepth = 1
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth)

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
    })

    function makeInstance (geometry, color, x) {
        const cube = new THREE.Mesh(geometry, material)
        scene.add(cube)

        cube.position.x = x

        return cube
    }

    const cubes = [
        makeInstance(geometry, 0x44aa88,  0),
        makeInstance(geometry, 0x8844aa, -2),
        makeInstance(geometry, 0xaa8844,  2),
    ]


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

        uniforms.iTime.value = time

        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * .1
            const rot = time * speed
            cube.rotation.x = rot
            cube.rotation.y = rot
        })

        renderer.render(scene, camera)

        requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
}

main()
