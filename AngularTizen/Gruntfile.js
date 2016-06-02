module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        }, 
        copy:  {
            main: {
                files: [
                    {expand: true, flatten:true, src: ['node_modules/angular/angular.js'], dest: 'lib/angular/', filter: 'isFile'},
                    {expand: true, flatten:true,src: ['node_modules/angular-mocks/angular-mocks.js'], dest: 'lib/angular-mocks/', filter: 'isFile'},
                    {expand: true, cwd: 'node_modules/tizen-tau-wearable/', src:['**'], dest: 'lib/tizen-tau-wearable/', filter: 'isFile'}
                ]
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', ['uglify', 'copy']);


};
