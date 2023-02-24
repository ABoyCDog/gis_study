import { TempNode } from '../core/TempNode';

export class SubSlotNode extends TempNode {

	constructor( slots?: object );

	slots: Node[];

	copy( source: SubSlotNode ): this;

}
