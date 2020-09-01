const B_LEN = 3;
class Vec3Buffer{
	static from( buf ){ return new Vec3Buffer( null, null, buf ); }

	constructor( capacity=3, use_all=false, buf=null ){
		if( buf ){ // Passed in a Float Array filled with Vertex Positions.
			this.buffer 	= buf;
			this.capacity 	= buf.length / 3;
			this.len 		= this.capacity;
		}else{
			this.capacity	= capacity;
			this.buffer		= new Float32Array( this.capacity * B_LEN );
			this.len 		= (!use_all)? 0 : capacity;
		}
	}

	///////////////////////////////////////////////////////////////////
	// Buffer Data Management
	///////////////////////////////////////////////////////////////////

		dissolve(){
			let tmp = this.buffer;
			this.buffer = null;
			return tmp;
		}

		full_reset( x=0, y=0, z=0 ){
			let i;
			for( i=0; i < this.buffer.length; i += B_LEN ){
				this.buffer[ i ]	= x;
				this.buffer[ i+1 ]	= y;
				this.buffer[ i+2 ]	= z;
			}

			this.len = this.capacity;
			return this;
		}

		push(){
			let t_len = this.len + arguments.length;
			if( t_len > this.capacity ){ console.log("Vec3Buffer is at capacity"); return this; }

			let i, ii, offset = this.len * B_LEN;
			for( i=0; i < arguments.length; i++ ){
				ii = offset + i * B_LEN;
				this.buffer[ ii ] 	= arguments[ i ][ 0 ];
				this.buffer[ ii+1 ] = arguments[ i ][ 1 ];
				this.buffer[ ii+2 ] = arguments[ i ][ 2 ];
			}

			this.len = t_len;
			return this;
		}

		push_raw( x, y, z ){
			let t_len = this.len + 1;
			if( t_len > this.capacity ){ console.log("Vec3Buffer is at capacity"); return this; }

			let offset = this.len * B_LEN;
			this.buffer[ offset ] 	= x;
			this.buffer[ offset+1 ] = y;
			this.buffer[ offset+2 ] = z;
			this.len++;

			return this;
		}

		rm( i ){
			if( i >= this.len ){ console.log( "Can not remove, Index is greater then length"); return this; }

			//If removing last one, Just change the length
			let b_idx = this.len - 1;
			if( i == b_idx ){ this.len--; return this; }

			let a_idx				= i * B_LEN;	// Index of Vec to Remove
			b_idx					*= B_LEN;		// Index of Final Vec.
			this.buffer[ a_idx ]	= this.buffer[ b_idx ];
			this.buffer[ a_idx+1 ]	= this.buffer[ b_idx+1 ];
			this.buffer[ a_idx+2 ]	= this.buffer[ b_idx+2 ];
			this.len--;

			return this;
		}

		expand_by( size, use_all=false ){
			let capacity	= this.capacity + size,
				fb			= new Float32Array( capacity * B_LEN ),
				i;

			for( i=0; i < this.buffer.length; i++ ) fb[ i ] = this.buffer[ i ];

			this.capacity	= capacity;
			this.buffer		= fb;

			if( use_all ) this.len = this.capacity;
			return this;
		}

	///////////////////////////////////////////////////////////////////
	// Getters / Setters
	///////////////////////////////////////////////////////////////////
		
		get byte_capacity(){ return this.buffer.byteLength; }	// Total Bytes Available
		get byte_len(){ return this.len * B_LEN * 4; }			// Length of Bytes in Use
		get buf_len(){ return this.len * B_LEN; }
		get buf_capacity(){ return this.buffer.length; }

		set( i, x, y, z ){	// RENAME TO RAW SET
			i *= B_LEN;
			this.buffer[ i ]	= x;
			this.buffer[ i+1 ]	= y;
			this.buffer[ i+2 ]	= z;
			return this;
		}

		copy_to( i, out ){	// TODO, Maybe Rename it to GET
			i *= B_LEN;
			out[ 0 ] = this.buffer[ i ];
			out[ 1 ] = this.buffer[ i+1 ];
			out[ 2 ] = this.buffer[ i+2 ];
			return out;
		}

		copy( i, v ){	// RENAME TO SET
			i *= B_LEN;
			this.buffer[ i ]	= v[0]; 
			this.buffer[ i+1 ]	= v[1]; 
			this.buffer[ i+2 ]	= v[2]; 
			return this;
		}

		from_add( i, a, b ){
			i *= B_LEN;
			this.buffer[ i ]	= a[0] + b[0];
			this.buffer[ i+1 ]	= a[1] + b[1];
			this.buffer[ i+2 ]	= a[2] + b[2];
			return this;
		}

		from_sub( i, a, b ){
			i *= B_LEN;
			this.buffer[ i ]	= a[0] - b[0];
			this.buffer[ i+1 ]	= a[1] - b[1];
			this.buffer[ i+2 ]	= a[2] - b[2];
			return this;
		}

		from_lerp( i, a, b, t ){ //Linear Interpolation : (1 - t) * v0 + t * v1;
			let ti = 1 - t;
			i *= B_LEN;

			this.buffer[ i ]	= a[0] * ti + b[0] * t;
			this.buffer[ i+1 ]	= a[1] * ti + b[1] * t;
			this.buffer[ i+2 ]	= a[2] * ti + b[2] * t;
			return this;
		}

	///////////////////////////////////////////////////////////////////
	// Basic Math Operations
	///////////////////////////////////////////////////////////////////			
	
		scale( i, s ){
			i *= B_LEN;
			this.buffer[ i ]	*= s;
			this.buffer[ i+1 ]	*= s;
			this.buffer[ i+2 ]	*= s;
			return this;
		}

	///////////////////////////////////////////////////////////////////
	// Vector Math Operations
	///////////////////////////////////////////////////////////////////	
		
		norm( i ){
			i *= B_LEN;

			let x	= this.buffer[ i ],
				y	= this.buffer[ i+1 ],
				z	= this.buffer[ i+2 ],
				mag = Math.sqrt( x**2 + y**2 + z**2 );

			if( mag == 0 ) return this;

			mag = 1 / mag;
			this.buffer[ i ]	= x * mag;
			this.buffer[ i+1 ]	= y * mag;
			this.buffer[ i+2 ]	= z * mag;

			return this;
		}

	///////////////////////////////////////////////////////////////////
	// RANGE OPERATIONS
	///////////////////////////////////////////////////////////////////

		rng_add( x, y, z, a=0, b=null ){
			let i 	= a * B_LEN,
				ii	= ( b != null )? b * B_LEN : this.len * B_LEN,
				buf = this.buffer;

			for( i; i < ii; i += B_LEN ){
				buf[ i ]	+= x;
				buf[ i+1 ]	+= y;
				buf[ i+2 ]	+= z;
			}

			return this;
		}

	///////////////////////////////////////////////////////////////////
	// 
	///////////////////////////////////////////////////////////////////
		
		compute_bounds( min, max ){
			let x_min 	= Infinity,
				y_min 	= Infinity,
				z_min	= Infinity,
				x_max 	= -Infinity,
				y_max 	= -Infinity,
				z_max	= -Infinity,
				x,y,z;

			for( let i=0; i < this.buffer.length; i+=3 ){
				x = this.buffer[ i ];
				y = this.buffer[ i+1 ];
				z = this.buffer[ i+2 ];
				if( x < x_min ) x_min = x;
				if( x > x_max ) x_max = x;

				if( y < y_min ) y_min = y;
				if( y > y_max ) y_max = y;

				if( z < z_min ) z_min = z;
				if( z > z_max ) z_max = z;
			}
			
			min[ 0 ] = x_min;
			min[ 1 ] = y_min;
			min[ 2 ] = z_min;
			max[ 0 ] = x_max;
			max[ 1 ] = y_max;
			max[ 2 ] = z_max;
		}
}

export default Vec3Buffer;