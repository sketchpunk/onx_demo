class Vec2 extends Float32Array{
	static UP		= new Vec2( 0, 1 );
	static RIGHT	= new Vec2( 1, 0 );
	static LEFT		= new Vec2( -1, 0 );
	static DOWN		= new Vec2( 0, -1 );
	static ZERO		= new Vec2( 0, 0 );

	constructor( ini ){
		super( 2 );
		if(ini instanceof Vec2 || (ini && ini.length == 2)){	this[0] = ini[0];		this[1] = ini[1]; }
		else if(arguments.length == 2){ 						this[0] = arguments[0];	this[1] = arguments[1]; }
		else{													this[0] = this[1] = ini || 0; }
	}

	// #region GETTERS / SETTERS
	get x(){ return this[0]; }	set x(val){ this[0] = val; }
	get y(){ return this[1]; }	set y(val){ this[1] = val; }
	set( x, y ){ this[0] = x; this[1] = y; return this;}

	clone(){ return new Vec2(this); }
	copy(v){ this[0] = v[0]; this[1] = v[1]; return this; }

	fromAngleLen(ang, len){
		this[0] = len * Math.cos(ang);
		this[1] = len * Math.sin(ang);
		return this;
	}

	get_angle(v = null){
		if(v){
			return Math.acos( Vec2.dot(this,v) / (this.length() * v.length()) );

			//var x = v[0] - this[0],
			//	y = v[1] - this[1];
			//return Math.atan2(y, x);
		}
		return Math.atan2(this[1], this[0]);
	}

	//When values are very small, like less then 0.000001, just make it zero.
	near_zero(x = 1e-6,y = 1e-6){
		if( Math.abs( this[0] ) <= x ) this[0] = 0;
		if( Math.abs( this[1] ) <= y ) this[1] = 0;
		return this;
	}

	set_len( len ){ return this.norm().scale( len ); }
	len( v ){
		//Only get the magnitude of this vector
		if(v === undefined) return Math.sqrt( this[0]*this[0] + this[1]*this[1] );

		//Get magnitude based on another vector
		let x = this[0] - v[0],
			y = this[1] - v[1];

		return Math.sqrt( x*x + y*y );
	}
	
	len_sqr( v ){
		//Only get the squared magnitude of this vector
		if(v === undefined) return this[0]*this[0] + this[1]*this[1];

		//Get squared magnitude based on another vector
		let x = this[0] - v[0],
			y = this[1] - v[1];

		return x*x + y*y;
	}
	// #endregion ///////////////////////////////////////////////////////////////////////

	// #region FROM OPERATIONS
	from_add( a, b ){ this[0] = a[0] + b[0]; this[1] = a[1] + b[1]; return this; }
	from_sub( a, b ){ this[0] = a[0] - b[0]; this[1] = a[1] - b[1]; return this; }
	from_scale( a, s ){ this[0] = a[0] * s; this[1] = a[1] * s; return this; }
	from_lerp( a, b, t ){
		let tt = 1 - t;
		this[0] = a[0] * tt + b[0] * t;
		this[1] = a[1] * tt + b[1] * t;
		return this;
	}

	from_vec3( v, z_plane=true ){
		this[0] = v[0];
		this[1] = ( z_plane )? v[2] : v[1];
		return this;
	}
	// #endregion ///////////////////////////////////////////////////////////////////////

	// #region MATH OPERATIONS
	add( v ){ this[0] += v[0]; this[1] += v[1]; return this; }
	add_raw( x, y ){ this[0] += x; this[1] += y; return this; }

	sub( v ){ this[0] -= v[0]; this[1] -= v[1]; return this; }
	mul( v ){ this[0] *= [0]; this[1] *= [1]; return this; }

	div( v ){
		this[0] = (v[0] != 0)? this[0] / v[0] : 0;
		this[1] = (v[1] != 0)? this[1] / v[1] : 0;
		return this;
	}

	scale( v ){ this[0] *= v; this[1] *= v; return this; }
	div_scale( v ){ this[0] /= v; this[1] /= v; return this; }

	div_inv_scale( v, out=null ){
		out = out || this;
		out[0] = ( this[0] != 0 )? v / this[0] : 0;
		out[1] = ( this[1] != 0 )? v / this[1] : 0;
		return out;
	}

	floor(out=null){
		out = out || this;
		out[0] = Math.floor( this[0] );
		out[1] = Math.floor( this[1] );
		return out;
	}
	
	norm( out=null ){
		let mag = Math.sqrt( this[0]*this[0] + this[1]*this[1] );
		if(mag == 0) return this;

		out = out || this;
		out[0] = this[0] / mag;
		out[1] = this[1] / mag;

		return out;
	}

	lerp( v, t, out ){
		out = out || this;
		let tMin1 = 1 - t;

		//Linear Interpolation : (1 - t) * v0 + t * v1;
		out[0] = this[0] * tMin1 + v[0] * t;
		out[1] = this[1] * tMin1 + v[1] * t;
		return out;
	}

	rotate( rad, out ){
		out = out || this;

		let cos	= Math.cos( rad ),
			sin	= Math.sin( rad ),
			x	= this[ 0 ],
			y	= this[ 1 ];

		out[0] = x * cos - y * sin;
		out[1] = x * sin + y * cos;
		return out;
	}

	rotate_deg( deg, out ){
		out = out || this;

		let rad	= deg * Math.PI / 180,
			cos	= Math.cos( rad ),
			sin	= Math.sin( rad ),
			x	= this[ 0 ],
			y	= this[ 1 ];

		out[0] = x * cos - y * sin;
		out[1] = x * sin + y * cos;
		return out;
	}

	invert( out=null ){
		out = out || this;
		out[0] = -this[0];
		out[1] = -this[1];
		return out;
	}

	perp_cw(){	// Perpendicular ClockWise
		let x = this[ 0 ];
		this[ 0 ] = this[ 1 ];
		this[ 1 ] = -x;
		return this;
	}

	perp_ccw(){	// Perpendicular Counter-ClockWise
		let x = this[ 0 ];
		this[ 0 ] = -this[ 1 ];
		this[ 1 ] = x;
		return this;
	}

	// #endregion ///////////////////////////////////////////////////////////////////////

	// #region STATIC OPERATIONS
	static add( a, b, out ){
		out = out || new Vec2();
		out[0] = a[0] + b[0];
		out[1] = a[1] + b[1];			
		return out;
	}

	static sub(a, b, out){ 
		out = out || new Vec2();
		out[0] = a[0] - b[0];
		out[1] = a[1] - b[1];
		return out;
	}

	static scale(v, s, out = null){
		out = out || new Vec2();
		out[0] = v[0] * s;
		out[1] = v[1] * s;
		return out;
	}

	static dot(a,b){ return a[0] * b[0] + a[1] * b[1]; }
	static det(a,b){ return a[0] * b[1] - a[1] * b[0]; } // "cross product" / determinant also = len(a)*len(b) * sin( angle );


	static project( from, to, out=null ){
		// Modified from https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Vector3.cs#L265
		// dot( a, b ) / dot( b, b ) * b
		out = out || new Vec2();

		let denom = Vec2.dot( to, to );
		if( denom < 0.000001 ) return out.copy( Vec2.ZERO );
	
		let scl	= Vec2.dot( from, to ) / denom;
		return out.set( to[0] * scl, to[1] * scl );
	}

	// From FROM and TO should have the same Origin.
	// FROM is a straight line from origin to plane. May need to do some extra projection to get this value.
	// To is treated like a Ray from the origin.
	static project_plane( from, to, plane_norm, out=null ){
		out = out || new Vec2();

		let denom = Vec2.dot( to, plane_norm );
		if( denom < 0.000001 && denom > -0.000001 ) return out.copy( Vec2.ZERO );

		let t = Vec2.dot( from, plane_norm ) / denom;
		return out.from_scale( to, t );
	}

	static floor(v, out=null){
		out = out || new Vec2();
		out[0] = Math.floor( v[0] );
		out[1] = Math.floor( v[1] );
		return out;
	}

	static fract(v, out=null){
		out = out || new Vec2();
		out[0] = v[0] - Math.floor( v[0] );
		out[1] = v[1] - Math.floor( v[1] );
		return out;
	}

	static len( v0, v1 ){
		let x = v0[0] - v1[0],
			y = v0[1] - v1[1];
		return Math.sqrt( x*x + y*y );
	}

	static len_sqr( v0, v1 ){
		let x = v0[0] - v1[0],
			y = v0[1] - v1[1];
		return x*x + y*y;
	}

	static lerp(v0, v1, t, out){
		out = out || new Vec2();
		var tMin1 = 1 - t;
		
		//Linear Interpolation : (1 - t) * v0 + t * v1;
		out[0] = v0[0] * tMin1 + v1[0] * t;
		out[1] = v0[1] * tMin1 + v1[1] * t;
		return out;
	}

	static rotate_deg( v, deg, out ){
		out = out || new Vec2();

		let rad	= deg * Math.PI / 180,
			cos	= Math.cos( rad ),
			sin	= Math.sin( rad ),
			x	= v[ 0 ],
			y	= v[ 1 ];

		out[0] = x * cos - y * sin;
		out[1] = x * sin + y * cos;
		return out;
	}

	static perp_cw( v, out=null ){	// Perpendicular ClockWise
		out = out || new Vec2();
		out[ 0 ] = v[ 1 ];
		out[ 1 ] = -v[ 0 ];
		return out;
	}

	static perp_ccw( v, out=null ){	// Perpendicular Counter-ClockWise
		out = out || new Vec2();
		out[ 0 ] = -v[ 1 ];
		out[ 1 ] = v[ 0 ];
		return out;
	}
	// #endregion ///////////////////////////////////////////////////////////////////////
}

export default Vec2;