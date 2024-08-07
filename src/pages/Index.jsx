import { useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Model = ({ url }) => {
  const gltf = useLoader(GLTFLoader, url);
  return <primitive object={gltf.scene} />;
};

const Index = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = useCallback((event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      setFile(url);
    }
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
        <div className="w-full max-w-2xl h-[400px] bg-white rounded-lg shadow-lg overflow-hidden">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
              <Model url={file} />
              <OrbitControls />
            </Suspense>
          </Canvas>
        </div>
      )}
    </div>
  );
};

export default Index;
