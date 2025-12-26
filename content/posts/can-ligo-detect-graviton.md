+++
title = "Can LIGO Detect A Graviton?"
date = 2011-12-28T17:51:16-08:00
draft = false

[taxonomies]
tags = ["gravitational-waves", "graviton", "ligo", "physics"]
+++
*A lecture given 10/27/08 by Professor Freeman Dyson of the Institute of
Advanced Studies at Princeton, in honor of the 100th anniversary of the
founding of the University of California, Davis.*

$$E=\left(\frac{c^{2}}{32\pi G}\right)\omega^{2}f^{2}$$
is the energy per gravity wave, where f is the dimensionless
amplitude/strain.  

$$E_{s}=\frac{\hbar\omega^{4}}{c^{3}}$$
is the energy per graviton, taken from $\hbar\omega$ energy times
$\frac{\omega^3}{c^3}$ density  

$$f=\left(32\pi\right)^{\frac{1}{2}}\left(L_{p}\frac{\omega}{c}\right)$$
is the strain per graviton.  

$$L_{p}=\left(\frac{G\hbar}{c^{3}}\right)^{\frac{1}{2}}=1.4\times10^{-33}cm$$

$$\delta=\left(32\pi\right)^{\frac{1}{2}}L_{p}$$
Gives the linear displacement per graviton.  

Note that spherical objects can't radiate gravitational waves, and that
binary stars produce kilohertz gravity waves.  

LIGO's threshold is therefore $10^{37}$ gravitons.  

$$M\delta^{2}\geq\hbar T$$
is the uncertainty in position and velocity.  

$$D\leq\left(\frac{GM}{c^{2}}\right)$$
(from combining previous two equations)  

$$\delta^{2}\geq\frac{\hbar D}{M_{s}}$$

$$\frac{GM}{c^{2}}\geq\left(\frac{c}{s}D\right)>D$$
Which exceeds the Schwarzschild radius, so impossible.  

Then the Bohr-Rosenfeld argument is:  
$$\Delta E\_{x}(1)\Delta E_{x}(2)\approx\hbar\left|A(1,2)-A(2,1)\right|$$
where A(2,1) is the field from dipole 2 at location 1.  

The detector is described by:  
$$D_{ab}=m\int\Psi_{b}^{*}xy\Psi_{a}d\tau$$
where a is the initial state, b is the final state, and m is the detector mass.  

$$\sigma(\omega)=\left(4\pi^{2}G\frac{\omega^{3}}{c^{3}}\right)\sum_{b}\left|D_{ab}\right|^{2}\delta(E_{b}-E_{a}-\hbar\omega)$$

$$S_{a}=\int\sigma(\omega)\frac{d\omega}{\omega}$$
is the logarithmic average taken over the graviton cross section.  

$$S_{a}=4\pi^{2}L_{p}^{2}Q$$

Now consider the gravitophotoelectric effect, where the graviton removes
an electron.  

$$Q=\int\left|\left(x\frac{\partial}{\partial
y}+y\frac{\partial}{\partial
x}\right)\Psi_{a}\right|^{2}d\tau$$  

$$Q=\frac{\int\bar{r}^{4}\left[f'(r)\right]^{2}d\bar{r}}{\int
r^{2}\left[f(r)\right]^{2}dr}$$

$$\int
r^{4}\left[f'+\left(\frac{3}{2}r\right)f\right]^{2}dr>0$$

$$Q>\frac{3}{4}$$

$$f(r)=r^{-n}e^{-\frac{r}{R}}$$

$$Q=1-\frac{n}{6}$$

$$4\pi^{2}L_{p}^{2}=4\pi^{2}G\frac{\hbar}{c^{3}}=8\times10^{-65}cm^{2}$$

This means that if you take a detector the mass of the Earth, squash it
into a large flat sheet, and run it for the lifetime of the universe,
you'll detect 4 gravitons.  

From the Sun, there are $10^{8}$W of gravitons and $10^{25}$W of
neutrinos, and we can detect gravitons about $10^{-35}$ less than
neutrinos.  

Special thanks to [KaTeX] for rendering the math on this site.[^1]

*N.B. There were good follow-up posts on the now-defunct Cosmic Variance blog (formerly at Discover Magazine) that provided background information on gravitational waves, including "Catching the Waves" (2009) and "The Difficult Childhood of Gravitational Waves" (2007).*

[^1]: This site is built with [Zola] (theme: DeepThought) and uses [KaTeX] auto-render for [LaTeX]-style math.

[Zola]: https://www.getzola.org
[KaTeX]: https://katex.org
[LaTeX]: https://www.latex-project.org
