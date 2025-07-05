import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { KeyboardControls, useKeyboardControls } from '@react-three/drei';
import { useGame } from '../stores/gameStore';
import * as THREE from 'three';

// Define control scheme for MMORPG movement
enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

const keyMap = [
  { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
  { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
  { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
  { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
  { name: Controls.jump, keys: ['Space'] },
];

// Player character component
function Player({ position, onMove }: { position: [number, number, number], onMove: (pos: [number, number, number]) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [subscribe, get] = useKeyboardControls<Controls>();
  const [velocity, setVelocity] = useState([0, 0, 0]);
  const [isGrounded, setIsGrounded] = useState(true);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const controls = get();
    const moveSpeed = 5;
    const jumpForce = 10;
    const gravity = -20;
    
    let newVelocity = [...velocity];
    
    // Movement controls
    if (controls.forward) {
      newVelocity[2] -= moveSpeed * delta;
      console.log('Moving forward');
    }
    if (controls.back) {
      newVelocity[2] += moveSpeed * delta;
      console.log('Moving back');
    }
    if (controls.left) {
      newVelocity[0] -= moveSpeed * delta;
      console.log('Moving left');
    }
    if (controls.right) {
      newVelocity[0] += moveSpeed * delta;
      console.log('Moving right');
    }
    
    // Jump control
    if (controls.jump && isGrounded) {
      newVelocity[1] = jumpForce;
      setIsGrounded(false);
      console.log('Jumping');
    }
    
    // Apply gravity
    if (!isGrounded) {
      newVelocity[1] += gravity * delta;
    }
    
    // Ground collision (simple)
    const newPosition: [number, number, number] = [
      position[0] + newVelocity[0],
      Math.max(0.5, position[1] + newVelocity[1] * delta), // Keep above ground
      position[2] + newVelocity[2]
    ];
    
    // Check if landed
    if (newPosition[1] <= 0.5 && newVelocity[1] <= 0) {
      newPosition[1] = 0.5;
      newVelocity[1] = 0;
      setIsGrounded(true);
    }
    
    // Apply friction to horizontal movement
    newVelocity[0] *= 0.9;
    newVelocity[2] *= 0.9;
    
    setVelocity(newVelocity);
    onMove(newPosition);
    
    // Update mesh position
    meshRef.current.position.set(newPosition[0], newPosition[1], newPosition[2]);
  });

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial color="#00d2ff" />
      {/* Character label */}
      <mesh position={[0, 1.5, 0]}>
        <planeGeometry args={[2, 0.5]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
    </mesh>
  );
}

// Terrain component
function Terrain() {
  return (
    <mesh position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshLambertMaterial color="#4a5568" />
    </mesh>
  );
}

// Camera controller
function CameraController({ target }: { target: [number, number, number] }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  useFrame((state) => {
    if (!cameraRef.current) return;
    
    // Follow camera positioned behind and above player
    const idealPosition = new THREE.Vector3(
      target[0] - 8,
      target[1] + 6,
      target[2] + 8
    );
    
    const lookAtPosition = new THREE.Vector3(target[0], target[1], target[2]);
    
    cameraRef.current.position.lerp(idealPosition, 0.1);
    cameraRef.current.lookAt(lookAtPosition);
  });

  return <perspectiveCamera ref={cameraRef} />;
}

// Main 3D scene
function Scene() {
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0.5, 0]);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 10]} 
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Terrain */}
      <Terrain />
      
      {/* Player */}
      <Player position={playerPosition} onMove={setPlayerPosition} />
      
      {/* Camera controller */}
      <CameraController target={playerPosition} />
    </>
  );
}

export function GameEngine() {
  const game = useGame();
  const setConnected = game.setConnected;
  const setCharacter = game.setCharacter;

  useEffect(() => {
    // Simulate connection and character setup
    setTimeout(() => {
      setConnected(true);
      setCharacter({
        name: 'Demo Hero',
        level: 1,
        race: 'human',
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        gold: 12500,
        strength: 15,
        dexterity: 12,
        intelligence: 10,
        constitution: 14,
        wisdom: 11,
        charisma: 9
      });
    }, 1000);
  }, [setConnected, setCharacter]);

  return (
    <div className="game-canvas" style={{ width: '100%', height: '100%' }}>
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          camera={{ position: [0, 6, 8], fov: 75 }}
          style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}
        >
          <Scene />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}