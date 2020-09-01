import Vec3 from "./Vec3.js";
import Quat from "./Quat.js";

// http://gabormakesgames.com/blog_transforms_transforms.html

class Transform{
	constructor( t ){
		this.rot	= new Quat();
		this.pos	= new Vec3();
		this.scl 	= new Vec3( 1, 1, 1 );

		if( arguments.length == 1 ){
			this.rot.copy( t.rot );
			this.pos.copy( t.pos );
			this.scl.copy( t.scl );
		}else if( arguments.length == 3 ){
			this.rot.copy( arguments[ 0 ] );
			this.pos.copy( arguments[ 1 ] );
			this.scl.copy( arguments[ 2 ] );
		}
	}

	//////////////////////////////////////////////////////////////////////
	// GETTER / SETTER
	//////////////////////////////////////////////////////////////////////
		reset(){
			this.rot.set( 0,0,0,1 );
			this.pos.set( 0,0,0 );
			this.scl.set( 1,1,1 );
			return this;
		}

		copy( t ){
			this.rot.copy( t.rot );
			this.pos.copy( t.pos );
			this.scl.copy( t.scl );
			return this;
		}

		set( r=null, p=null, s=null ){
			if( r )	this.rot.copy( r );
			if( p )	this.pos.copy( p );
			if( s )	this.scl.copy( s );
			return this;
		}

		clone(){ return new Transform( this ); }

	//////////////////////////////////////////////////////////////////////
	// METHODS
	//////////////////////////////////////////////////////////////////////
		from_add( tp, tc ){
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
			let v = new Vec3().from_mul( tp.scl, tc.pos ); // parent.scale * child.position;
			v.transform_quat( tp.rot ); //Vec3.transform_quat( v, tp.rot, v );
			this.pos.from_add( tp.pos, v ); // Vec3.add( tp.pos, v, this.pos );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// SCALE - parent.scale * child.scale
			this.scl.from_mul( tp.scl, tc.scl );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// ROTATION - parent.rotation * child.rotation
			this.rot.from_mul( tp.rot, tc.rot );
			//this.rot.from_mul( tc.rot, tp.rot );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			return this;
		}

		// Computing Transforms, Parent -> Child
		add( cr, cp, cs = null ){
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// If just passing in Tranform Object
			if(arguments.length == 1){
				cr = arguments[0].rot;
				cp = arguments[0].pos;
				cs = arguments[0].scl;
			}

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
			this.pos.add( Vec3.mul( this.scl, cp ).transform_quat( this.rot ) );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// SCALE - parent.scale * child.scale
			if( cs ) this.scl.mul( cs );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// ROTATION - parent.rotation * child.rotation
			this.rot.mul( cr );

			return this;
		}

		// Computing Transforms in reverse, Child - > Parent
		add_rev( pr, pp, ps = null ){
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// If just passing in Tranform Object
			if(arguments.length == 1){
				pr = arguments[0].rot;
				pp = arguments[0].pos;
				ps = arguments[0].scl;
			}

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
			// The only difference for this func, We use the IN.scl & IN.rot instead of THIS.scl * THIS.rot
			// Consider that this Object is the child and the input is the Parent.
			this.pos.mul( ps ).transform_quat( pr ).add( pp );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// SCALE - parent.scale * child.scale
			if( ps ) this.scl.mul( ps );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// ROTATION - parent.rotation * child.rotation
			this.rot.pmul( pr ); // Must Rotate from Parent->Child, need PMUL

			return this
		}

		add_pos( cp, ignore_scl = false ){
			//POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
			if( ignore_scl )	this.pos.add( Vec3.transform_quat( cp, this.rot ) );
			else 				this.pos.add( new Vec3( cp ).transform_quat( this.rot ) );
			return this;
		}

		clear(){
			this.pos.set( 0, 0, 0 );
			this.scl.set( 1, 1, 1 );
			this.rot.reset();
			return this;
		}

		transform_vec( v, out = null ){
			//GLSL - vecQuatRotation(model.rotation, a_position.xyz * model.scale) + model.position;
			return (out || v)
				.from_mul( v, this.scl )
				.transform_quat( this.rot )
				.add( this.pos );
		}

		dispose(){
			delete this.pos;
			delete this.rot;
			delete this.scl;
		}

	//////////////////////////////////////////////////////////////////////
	// STATIC FUNCTIONS
	//////////////////////////////////////////////////////////////////////
		static add( tp, tc, tOut ){
			tOut = tOut || new Transform();

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			//POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
			
			//tOut.pos.from_add( tp.pos, Vec3.mul( tp.scl, tc.pos ).transform_quat( tp.rot ) );
			tOut.pos.from_add( tp.pos, new Vec3( tc.pos ).transform_quat( tp.rot ) );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// SCALE - parent.scale * child.scale
			tOut.scl.from_mul( tp.scl, tc.scl ); //Vec3.mul( tp.scl, tc.scl, tOut.scl );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// ROTATION - parent.rotation * child.rotation
			tOut.rot.from_mul( tp.rot, tc.rot ); //Quat.mul( tp.rot, tc.rot, tOut.rot );

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			return tOut;
		}

		static invert( t, inv ){
			inv = inv || new Transform();

			// Invert Rotation
			t.rot.invert( inv.rot );		

			// Invert Scale
			inv.scl.x = ( t.scl.x != 0 )? 1 / t.scl.x : 0;
			inv.scl.y = ( t.scl.y != 0 )? 1 / t.scl.y : 0;
			inv.scl.z = ( t.scl.z != 0 )? 1 / t.scl.z : 0;

			// Invert Position : rotInv * ( invScl * invPos )
			t.pos.invert( inv.pos ).mul( inv.scl );
			Vec3.transform_quat( inv.pos, inv.rot, inv.pos );

			return inv;
		}

		static from_pos( x, y, z ){
			let t = new Transform();
			if( arguments.length == 3 )			t.pos.set( x, y, z );
			else if( arguments.length == 1 )	t.pos.copy( x );
			return t;
		}
}

export default Transform;

/*
	World Space Position to Local Space.
	
	V	.copy( gBWorld.eye_lid_upper_mid_l.pos ) // World Space Postion
	 	.add( [0, -0.05 * t, 0 ] )	//Change it
		.sub( gBWorld.eye_l.pos )	// Subtract from Parent's WS Position
		.div( gBWorld.eye_l.scl )	// Div by Parent's WS Scale
		.transform_quat( gBWorld.eye_l.rot_inv );	// Rotate by Parent's WS Inverse Rotation
*/