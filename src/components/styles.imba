global css body
	m:0
	mt:100px
	color: #34286f

global css .active
	cursor:default c:#d74d46

global css .red-hover
	cursor:pointer
	transition:color 0.25s
	@hover
		c:#d74d46

global css a
	text-decoration: none
	color: #34286f
	transition: 0.25s

global css li
	list-style:none

global css a@hover
	color: #d74d46

global css .link
	c:#d74d46
	c@hover:#5cffbe

global css .container
	display: flex
	flex-direction: row
	justify-content: space-between
	align-items: flex-start
	padding: 0 10%

global css .right
	flex: 1
	display: flex
	flex-direction: column
	justify-content: flex-start
	align-items: flex-end
	order: 2

global css .right h1
	color: inherit
	font-size: 60px
	margin-bottom: 0

global css .tabs
	font-size: 25px
	margin-top: 0

global css .left
	flex: 1
	display: flex
	flex-direction: column
	justify-content: center
	align-items: center
	font-style: italic
	text-align: left

global css ul
	p:0
	width: 100%

global css .left.home
	text-align: right

global css .left img
	width: 100%
	height: auto

global css .left.about img
	max-width: 300px

global css .left h3
	width: 100%

global css .left.projects h3
	text-align: right

global css .tabs
	list-style: none
	text-align: right

global css .quote
	margin-top: 150px
	font-size: 17px
	font-style: italic

global css .iframe-container
	overflow: hidden
	padding-top: 56.25%
	position: relative
	width: 100%

global css .iframe-container iframe
	border: 0
	height: 100%
	left: 0
	position: absolute
	top: 0
	width: 100%

global css body@!927

	margin: 0

	.container
		flex-direction: column
		justify-content: center
		align-items: center

	.left
		order: 2
		justify-content: center
		align-items: center

	.left.projects h3
		text-align: center

	.tabs
		text-align: center
		padding: 0
		margin: 0

	.quote
		margin: 10px 0

	.right
		order: 1
		justify-content: center
		align-items: center
		text-align: center
