import './components/home'
import './components/about'
import './components/projects'
import './components/illustrations'
import './components/goodbye'

import './components/styles'

import 'imba-magnify'

let view = "YOU ARE HERE"

let views = {
	"ABOUT": <about>
	"PROJECTS": <projects>
	"ILLUSTRATIONS": <illustrations>
	"GOODBYE!": <goodbye>
}

let quotes = {
	"YOU ARE HERE": '“Hello.” -Bryan Lee'
	"ABOUT": '“Good vibrations…” -Pegasus'
	"PROJECTS": "“Go big or go home.” -Abraham Lincoln"
	"ILLUSTRATIONS": "“Variety is the spice of life.” -Paulette Chandler"
	"GOODBYE!": "“Goodbye!” -Steve Martin"
}

tag Tab

	<self
		@click=(view = name)
		.active=(view == name)
		.red-hover
		[fs:25px @!927:22px]
	> name

tag app
	<self.container>

		<.right>

			<h1
				@click=(view = "YOU ARE HERE")
				.red-hover
				[fs:60px @!927:35px]
			> "BRYAN LEE"

			<ul.tabs>
				<Tab name="YOU ARE HERE">
				<Tab name="ABOUT">
				<Tab name="PROJECTS">
				<Tab name="ILLUSTRATIONS">
				<Tab name="GOODBYE!">

			<p.quote> quotes[view]

		if views.hasOwnProperty(view)
			<(views[view])>
		else
			<home>

imba.mount <app>
