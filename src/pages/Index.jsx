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

  useEffect(() => {
    if (cropCylinder) {
      const cylinderBSP = new ThreeBSP(cropCylinder);
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          const meshBSP = new ThreeBSP(child);
          const resultBSP = meshBSP.intersect(cylinderBSP);
          const result = resultBSP.toMesh(child.material);
          result.position.copy(child.position);
          result.rotation.copy(child.rotation);
          result.scale.copy(child.scale);
          scene.add(result);
          child.visible = false;
        }
      });
    }
  }, [gltf, cropCylinder, scene]);

  return <primitive object={gltf.scene} scale={[scale, scale, scale]} />;
};

const CropCylinder = ({ position, radius, height, setRef }) => {
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
      visible={false}
    >
      <meshBasicMaterial wireframe color="red" />
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
    setIsCropped(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8">JBL File Viewer</h1>
      <input
        type="file"
        accept=".jbl,.gltf,.glb"
        onChange={handleFileChange}
        className="mb-8 p-2 border border-gray-300 rounded"
      />
      {file && (
        <>
          <div className="w-full max-w-2xl h-[400px] bg-white rounded-lg shadow-lg overflow-hidden mb-4">
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
                />
                <OrbitControls />
              </Suspense>
            </Canvas>
          </div>
          <div className="w-full max-w-2xl mb-4 space-y-4">
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
            <Button onClick={handleCrop} disabled={isCropped}>
              Crop Model
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
