 
import {
	Color,
	Texture,
	CubeTexture,
	Vector2
} from '../../../../src/Three';

import { Node } from '../core/Node';
import { NodeMaterial } from './NodeMaterial';

export class MeshStandardNodeMaterial extends NodeMaterial {

	constructor();

	color: Color | Node;
	roughness: number | Node;
	metalness: number | Node;
	map: Texture | Node;
	normalMap: Texture | Node;
	normalScale: Vector2 | Node;
	metalnessMap: Texture | Node;
	roughnessMap: Texture | Node;
	envMap: CubeTexture | Node;

}
