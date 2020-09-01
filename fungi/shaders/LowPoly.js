import App from "../App.js";

const vert_src = `#version 300 es
	layout(location=0) in vec3 a_pos;

	uniform Global{ 
		mat4 proj_view; 
		mat4 camera_matrix;
		vec3 camera_pos;
		float delta_time;
		vec2 screen_size;
		float clock;
	} global;

	uniform Model{ 
		mat4 view_matrix;
	} model;

	out vec3 w_pos;
	flat out vec3 cam_pos;

	void main(void){
		vec4 world_pos = model.view_matrix * vec4( a_pos, 1.0 );

		w_pos		= world_pos.xyz;
		cam_pos		= global.camera_pos;
		gl_Position = global.proj_view * world_pos;
	}`;

const frag_src = `#version 300 es
	precision mediump float;

	in vec3 w_pos;
	flat in vec3 cam_pos;

	uniform vec3 color;
	out vec4 out_color;

	const vec3 lightPosition 		= vec3( 6.0, 10.0, 1.0 );
	const vec3 lightColor 			= vec3( 1.0, 1.0, 1.0 );
	const float uAmbientStrength	= 0.5;
	const float uDiffuseStrength	= 0.5;
	const float uSpecularStrength	= 0.2f;	//0.15
	const float uSpecularShininess	= 1.0f; //256.0

	void main(void){ 
		vec3 pixelNorm = normalize( cross( dFdx(w_pos), dFdy(w_pos) ) ); //Calc the Normal of the Rasterizing Pixel

		// Ambient Lighting
		vec3 cAmbient		= lightColor * uAmbientStrength;
		
		// Diffuse Lighting
		vec3 lightVector	= normalize(lightPosition - w_pos);		//light direction based on pixel world position
		float diffuseAngle	= max( dot(pixelNorm,lightVector) ,0.0);	//Angle between Light Direction and Pixel Direction (1==90d)
		vec3 cDiffuse		= lightColor * diffuseAngle * uDiffuseStrength;

		// Specular Lighting
		vec3 camVector		= normalize( cam_pos - w_pos );	//Camera Direction based on pixel world position
		vec3 reflectVector	= reflect(-lightVector, pixelNorm);		//Reflective direction of line from pixel direction as pivot.
		float specular		= pow( max( dot(reflectVector,camVector) ,0.0), uSpecularShininess ); //Angle of reflected light and camera eye
		vec3 cSpecular		= lightColor * specular * uSpecularStrength;

		out_color = vec4( color * (cAmbient + cDiffuse + cSpecular), 1.0 );
	}`;

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

let sh	= App.shader.new( "LowPoly", vert_src, frag_src, [
	{ name:"color", type:"rgb", value:"#ff7f7f" }
	], App.ubo.get_array( "Global","Model" )
);

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
export default sh;