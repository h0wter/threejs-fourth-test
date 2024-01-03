import { generateBlock } from "./generate-block.helper";

const generateTower = (floors, figuresPerFloor) => {
  const blocks = [];

  for (let i = 0; i < floors; i++) {
    const isFloorOdd = !!(i % 2);

    for (let k = 0; k < figuresPerFloor; k++) {
      const x = isFloorOdd ? 1 : k;
      const y = i + 0.5;
      const z = isFloorOdd ? k - 1 : 0;

      const position = { x, y, z, isRotated: isFloorOdd };
      const block = generateBlock(position);
      blocks.push(block);
    }
  }
  return blocks;
};

export { generateTower };
