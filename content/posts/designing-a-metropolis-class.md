---
title: "Designing a Metropolis Class"
date: 2016-08-18T18:37:26-08:00
draft: false
---
[Causal Dynamical Triangulations][1] computes the path integral of the
quantum universe numerically.

$$I_{EH}=\int\mathcal{D}[g(M)]e^{iS_{EH}} \rightarrow  \sum \frac{1}{C_t}e^{-S_{R}}$$

Where $S_{EH}$ is the Einstein-Hilbert action:

$$S_{EH}=\int \left[\frac{1}{2\kappa}(R-2\Lambda)+\mathcal{L}_{M}\right]\sqrt{-g}d^4x$$


 And $S_{R}$ is the Regge action:

 $$S_{R}=\frac{1}{8\pi G}
 \left[\sum_{hinges}A_i\delta_i+\Lambda\sum_{simplices}V_i\right]$$

_N.B. A [Wick rotation] converts the factor of $i$ in the continuous path
integral to a minus sign in the discrete path integral. In the Einstein-Hilbert
action we keep $\Lambda$, the Cosmological Constant, but ignore $\mathcal{L}$,
the matter Lagrangian. In the Regge action, we are essentially summing areas
times angles for the first term plus volumes in the second term._

To do this you use the [Metropolis-Hastings][2] algorithm, which is a member of
a more general class of algorithms known as [Markov Chain Monte Carlo (MCMC)][3]
methods, in particular random walk Monte Carlo methods.

Etc. etc.

Anyways, to have good results, you need to calculate something, in this case
perturbations of that universe via "[ergodic moves][4]", performed millions of
times per simulation, accurately.

The simulated universe is an n-dimensional [Delaunay Triangulation][5], which
is a good discretized n-dimensional manifold, which allows us to do Regge
calculus, or ["General Relativity without Coordinates"][6], conducted on said
triangulations.

Here is what these ergodic moves look like in 3D. By choosing to make these
moves according to the Metropolis-Hastings algorithm, you effectively sample
all possible paths as the universe moves from one time step to the next.

![(2,3) move](/img/23move.png)
![(2,6) move](/img/26move.png)
![(4,4) move](/img/44move.png)

Then you can collect data on the various ensembles, and get things like
[spectral dimension][11], [transition amplitudes][10], or in my case, the
[Newtonian Limit][7].

So that's the backstory.

To have results before, well, the end of the universe, you should use a fast
language like C++ together with a battle-tested library capable of manipulating
Delaunay triangulations in various dimensions, like [CGAL][8].

(Admittedly, the use of CGAL influenced the choice of language, as the
[SWIG Python bindings][9] weren't up to the task at the time.
They still lack access to the dD Triangulation package, which I need to
calculate 4D path integrals.)



[1]: http://arxiv.org/abs/hep-th/0105267
[2]: http://thy.phy.bnl.gov/~creutz/mypubs/pub044.pdf
[3]: https://en.wikipedia.org/wiki/Markov_chain_Monte_Carlo
[4]: http://www.sciencedirect.com/science/article/pii/055032139290012Z
[5]: http://www.mathworks.com/help/matlab/math/delaunay-triangulation.html
[6]: http://link.springer.com/article/10.1007/BF02733251
[7]: http://www.slideshare.net/acgetchell/aps-48348528
[8]: https://www.cgal.org/
[9]: https://github.com/CGAL/cgal-swig-bindings
[10]: http://arxiv.org/abs/1305.2932
[11]: http://arxiv.org/abs/hep-th/0505113
[Wick rotation]: https://en.wikipedia.org/wiki/Wick_rotation
