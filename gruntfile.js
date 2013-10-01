module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        bow: grunt.file.readJSON('bower.json'),
        uglify: {
        	options: {
        		// the banner is inserted at the top of the output
        		banner: '/*! <%= pkg.title %> v<%= bow.version %>\n(c) <%= grunt.template.today("yyyy") %> Amey Sakhadeo\n<%= bow.licenses[0].type %> License: <%= bow.licenses[0].url %> */\n',
                preserveComments : 'some'
        	},
        	dist: {
        		files: {
        		  'dist/jquery.tabulate.min.js': ['src/**/*.js']
        		}
        	}
        },
        jshint: {
        	files: ['src/**/*.js', 'test/**/*.js'],
        	// configure JSHint (documented at http://www.jshint.com/docs/)
        	options: {

        		globals: {
        		  jQuery: true,
        		  console: true,
        		  module: true
        		}
        	}
        }

    });

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	//grunt.loadNpmTasks('grunt-contrib-watch');

	//grunt.registerTask('test', ['jshint', 'qunit']);

	grunt.registerTask('default', ['jshint']);
    grunt.registerTask('build', ['jshint','uglify']);
};
