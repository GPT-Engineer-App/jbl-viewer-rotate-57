import { useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Slider } from "@/components/ui/slider";

const Model = ({ url, scale }) => {
  const gltf = useLoader(GLTFLoader, url);
  return <primitive object={gltf.scene} scale={[scale, scale, scale]} />;
};

const Index = () => {
  const [file, setFile] = useState(null);
  const [scale, setScale] = useState(1);

  const handleFileChange = useCallback((event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      setFile(url);
    }
  }, []);

  const handleScaleChange = useCallback((value) => {
    setScale(value[0]);
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
                <Model url={file} scale={scale} />
                <OrbitControls />
              </Suspense>
            </Canvas>
          </div>
          <div className="w-full max-w-2xl mb-4">
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
        </>
      )}
    </div>
  );
};

export default Index;
