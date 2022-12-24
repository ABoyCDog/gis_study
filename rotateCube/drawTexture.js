function drawCanvasTexture(textString, backgroundColor = '#999999') {
    // const drawingCanvas = document.getElementById( 'drawing-canvas' );
    const drawingCanvas = document.createElement("canvas");
    const drawingContext = drawingCanvas.getContext( '2d' );

    const width = 128;
    const height = 128;

    drawingCanvas.width = width;
      drawingCanvas.height = height;

    const baseline = height * 2 / 3;
    const fontSize = height / 2;
    const padding = width / 4;

    // let textString = "前";
    drawingContext.fillStyle = backgroundColor;
    drawingContext.fillRect( 0, 0, width, height );
    drawingContext.strokeStyle = '#red';
    drawingContext.font = `${fontSize}px Arial`;
    drawingContext.lineWidth = 4;
    drawingContext.strokeText(textString, padding, baseline);
    return drawingCanvas;
   }

   function addBox(halfSide, edgeLength) {

    if (boxFaces) {
     boxFaces.forEach(face ={>} {
      scene1.remove(face)
      face.geometry.dispose();
     });
     boxFaces = []
    }

    let textString = "前";
    let texture = new THREE.CanvasTexture(drawCanvasTexture(textString));
    canvasMaterial = new THREE.MeshBasicMaterial({
    });
    texture.needsUpdate = true;
    canvasMaterial.map = texture;
    // canvasMaterial.map.needsPMREMUpdate = true;

    const side = halfSide - edgeLength;

    const backColor1 = '#999999';
    const backColor2 = '#222222';
    const material1 = new THREE.MeshBasicMaterial( {
     color: backColor1
    });
    const material2 = new THREE.MeshBasicMaterial( {
     color: backColor2
    });

    const faceGeometry = new THREE.BufferGeometry();
    const faceVertices = new Float32Array( [
     -1.0,  1.0,  1.0,
     -1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
     
     1.0,  1.0,  1.0,
     -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
    ].map((value, index) ={>} {
     if (index % 3 === 2) return value * halfSide
     return value * side;
    }));
   
    // (u, 1 - v)
    const uvs = new Float32Array( [
     // 0, 0,
     // 0, 1,
     // 1, 0,

     // 1, 0,
     // 0, 1,
     // 1, 1,
     
     0, 1,
     0, 0,
     1, 1,

     1, 1,
     0, 0,
     1, 0,
    ])


    faceGeometry.setAttribute( 'position', new THREE.BufferAttribute( faceVertices, 3 ) );
    faceGeometry.setAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

    const edgeGeometry = new THREE.BufferGeometry();
    const edgeVertices = new Float32Array( [
     -1.0,  1.0,  1.0,
     -1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
     
     1.0,  1.0,  1.0,
     -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
    ].map((value, index) ={>} {
     if (index % 3 === 2) return value * halfSide
     return value * side;
    }));
    edgeGeometry.setAttribute( 'position', new THREE.BufferAttribute( edgeVertices, 3 ) );

    const frontFace = new THREE.Mesh( faceGeometry, canvasMaterial );
    scene1.add( frontFace );
    boxFaces.push(frontFace);

    textString = "左";
    texture = new THREE.CanvasTexture(drawCanvasTexture(textString));
    canvasMaterial = new THREE.MeshBasicMaterial({
     depthTest: false,
     side: THREE.DoubleSide
    });
    texture.needsUpdate = true;
    canvasMaterial.map = texture;
    const leftFace = new THREE.Mesh( faceGeometry, canvasMaterial );
    leftFace.rotateY( -Math.PI / 2);
    scene1.add( leftFace );
    boxFaces.push(leftFace);

    textString = "右";
    texture = new THREE.CanvasTexture(drawCanvasTexture(textString));
    canvasMaterial = new THREE.MeshBasicMaterial({
    });
    texture.needsUpdate = true;
    canvasMaterial.map = texture;
    const rightFace = new THREE.Mesh( faceGeometry, canvasMaterial );
    rightFace.rotateY( Math.PI / 2);
    scene1.add( rightFace );
    boxFaces.push(rightFace);

    textString = "后";
    texture = new THREE.CanvasTexture(drawCanvasTexture(textString));
    canvasMaterial = new THREE.MeshBasicMaterial({
    });
    texture.needsUpdate = true;
    canvasMaterial.map = texture;
    const backFace = new THREE.Mesh( faceGeometry, canvasMaterial );
    backFace.rotateY( Math.PI);
    scene1.add( backFace );
    boxFaces.push(backFace);

    textString = "顶";
    texture = new THREE.CanvasTexture(drawCanvasTexture(textString));
    canvasMaterial = new THREE.MeshBasicMaterial({
    });
    texture.needsUpdate = true;
    canvasMaterial.map = texture;
    const topFace = new THREE.Mesh( faceGeometry, canvasMaterial );
    topFace.rotateX( -Math.PI / 2);
    scene1.add( topFace );
    boxFaces.push(topFace);

    textString = "底";
    texture = new THREE.CanvasTexture(drawCanvasTexture(textString));
    canvasMaterial = new THREE.MeshBasicMaterial({
    });
    texture.needsUpdate = true;
    canvasMaterial.map = texture;
    const bottomFace = new THREE.Mesh( faceGeometry, canvasMaterial );
    bottomFace.rotateX( Math.PI / 2);
    scene1.add(bottomFace);
    boxFaces.push(bottomFace);
}