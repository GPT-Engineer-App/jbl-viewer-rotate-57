import { useState, useCallback, Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Cylinder } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import * as THREE from 'three';
import ThreeBSP from '../lib/ThreeBSP';

const Model = ({ url, scale, cropCylinder }) => {
  const gltf = useLoader(GLTFLoader, url);
  const { scene } = useThree();
  const [croppedModel, setCroppedModel] = useState(null);

  useEffect(() => {
    if (cropCylinder && gltf) {
      const cylinderGeometry = cropCylinder.geometry.clone();
      cylinderGeometry.applyMatrix4(cropCylinder.matrixWorld);
      const cylinderBSP = new ThreeBSP(cylinderGeometry);

      const newScene = new THREE.Scene();
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          const meshBSP = new ThreeBSP(child.geometry);
          const resultBSP = meshBSP.intersect(cylinderBSP);
          const result = resultBSP.toMesh(child.material);
          result.position.copy(child.position);
          result.rotation.copy(child.rotation);
          result.scale.copy(child.scale);
          newScene.add(result);
        }
      });
      setCroppedModel(newScene);
    } else {
      setCroppedModel(null);
    }
  }, [gltf, cropCylinder]);

  return (
    <>
      {croppedModel ? (
        <primitive object={croppedModel} scale={[scale, scale, scale]} />
      ) : (
        <primitive object={gltf.scene} scale={[scale, scale, scale]} />
      )}
    </>
  );
};

const CropCylinder = ({ position, radius, height, setRef, visible }) => {
  const meshRef = useRef();

  useEffect(() => {
    if (meshRef.current) {
      setRef(meshRef.current);
    }
  }, [setRef]);

  return (
    <Cylinder
      ref={meshRef}
      args={[radius, radius, height, 32]}
      position={position}
      visible={visible}
    >
      <meshBasicMaterial wireframe color="red" opacity={0.5} transparent />
    </Cylinder>
  );
};

const Index = () => {
  const [file, setFile] = useState(null);
  const [scale, setScale] = useState(1);
  const [cropCylinderRef, setCropCylinderRef] = useState(null);
  const [cylinderPosition, setCylinderPosition] = useState([0, 0, 0]);
  const [cylinderRadius, setCylinderRadius] = useState(1);
  const [cylinderHeight, setCylinderHeight] = useState(2);
  const [isCropped, setIsCropped] = useState(false);
  const [isCylinderVisible, setIsCylinderVisible] = useState(true);

  const handleFileChange = useCallback((event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      setFile(url);
      setIsCropped(false);
    }
  }, []);

  const handleScaleChange = useCallback((value) => {
    setScale(value[0]);
  }, []);

  const handleCrop = useCallback(() => {
    setIsCropped((prev) => !prev);
  }, []);

  const handlePositionChange = useCallback((axis, value) => {
    setCylinderPosition((prev) => {
      const newPosition = [...prev];
      newPosition[axis] = value[0];
      return newPosition;
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-100 to-green-200">
      <header className="bg-green-600 text-white py-4 px-6 shadow-md">
        <h1 className="text-3xl font-bold">Welcome Carlsberg</h1>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full">
          <h2 className="text-2xl font-semibold mb-6 text-center text-green-800">JBL File Viewer</h2>
          <input
            type="file"
            accept=".jbl,.gltf,.glb"
            onChange={handleFileChange}
            className="mb-8 p-3 border border-green-300 rounded-md w-full"
          />
          {file && (
            <>
              <div className="w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden mb-6">
                <Canvas>
                  <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                    <ambientLight intensity={1.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                    <Model url={file} scale={scale} cropCylinder={isCropped ? cropCylinderRef : null} />
                    <CropCylinder
                      position={cylinderPosition}
                      radius={cylinderRadius}
                      height={cylinderHeight}
                      setRef={setCropCylinderRef}
                      visible={isCylinderVisible}
                    />
                    <OrbitControls />
                  </Suspense>
                </Canvas>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjust Scale:
                  </label>
                  <Slider
                    defaultValue={[1]}
                    max={2}
                    min={0.1}
                    step={0.1}
                    onValueChange={handleScaleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cylinder Radius:
                  </label>
                  <Slider
                    defaultValue={[1]}
                    max={2}
                    min={0.1}
                    step={0.1}
                    onValueChange={(value) => setCylinderRadius(value[0])}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cylinder Height:
                  </label>
                  <Slider
                    defaultValue={[2]}
                    max={4}
                    min={0.5}
                    step={0.1}
                    onValueChange={(value) => setCylinderHeight(value[0])}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cylinder Position X:
                  </label>
                  <Slider
                    defaultValue={[0]}
                    max={2}
                    min={-2}
                    step={0.1}
                    onValueChange={(value) => handlePositionChange(0, value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cylinder Position Y:
                  </label>
                  <Slider
                    defaultValue={[0]}
                    max={2}
                    min={-2}
                    step={0.1}
                    onValueChange={(value) => handlePositionChange(1, value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cylinder Position Z:
                  </label>
                  <Slider
                    defaultValue={[0]}
                    max={2}
                    min={-2}
                    step={0.1}
                    onValueChange={(value) => handlePositionChange(2, value)}
                  />
                </div>
                <Button onClick={handleCrop} className="w-full bg-green-600 hover:bg-green-700 mb-4">
                  {isCropped ? "Uncrop Model" : "Crop Model"}
                </Button>
                <Button 
                  onClick={() => setIsCylinderVisible(prev => !prev)} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isCylinderVisible ? "Hide Cylinder" : "Show Cylinder"}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
