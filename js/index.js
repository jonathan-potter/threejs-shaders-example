function main() {
    const canvas = document.querySelector('#canvas');
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.autoClearColor = false;

    const camera = new THREE.OrthographicCamera(
      -1, // left
       1, // right
       1, // top
      -1, // bottom
      -1, // near,
       1, // far
    );
    const scene = new THREE.Scene();
    const plane = new THREE.PlaneBufferGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({
        color: 'red',
    });
    scene.add(new THREE.Mesh(plane, material));

    function resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }

    function render() {
      resizeRendererToDisplaySize(renderer);

      renderer.render(scene, camera);

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  main();
