import './components/home.imba'
import './components/about.imba'
import './components/projects.imba'
import './components/illustrations.imba'
import './components/goodbye.imba'
import './components/magnify.imba'
import './components/styles.imba'

let quotes =
	"/": '“Hello.” -Bryan Lee'
	"/ABOUT": '“Good vibrations…” -Pegasus'
	"/PROJECTS": "“Go big or go home.” -Abraham Lincoln"
	"/ILLUSTRATIONS": "“Variety is the spice of life.” -Paulette Chandler"
	"/GOODBYE!": "“Goodbye!” -Steve Martin"

tag app

	<self.container>

		<.right>

			<h1.red-hover route-to="/">
				css fs:60px @!927:35px
				"BRYAN LEE"

			<%tabs>
				css .red-hover fs:25px @!927:22px

				<.red-hover route-to="/"> "YOU ARE HERE"
				<.red-hover route-to="/ABOUT"> "ABOUT"
				<.red-hover route-to="/PROJECTS"> "PROJECTS"
				<.red-hover route-to="/ILLUSTRATIONS"> "ILLUSTRATIONS"
				<.red-hover route-to="/GOODBYE!"> "GOODBYE!"

			<p.quote> quotes[router.path]

		<app-goodbye route="/GOODBYE!">
		<app-illustrations route="/ILLUSTRATIONS">
		<app-projects route="/PROJECTS">
		<app-about route="/ABOUT">
		<app-home route="/*">

imba.mount <app>
