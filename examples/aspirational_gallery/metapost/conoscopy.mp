% conoscopy.mp
% L. Nobre G.
% 2013

input featpost3Dplus2D;

verbatimtex \documentclass{article}\begin{document} etex

beginfig(1);
  f := (6,5,5);
  Spread := 125;
  numeric maja, raya, angphi, angthe, decl, valy, valz, rectsiz;
  color majav, aphiv, aphip, majbv, perpv, perpvl;
  maja = 0.72;
  raya = 0.5;
  angphi = 15;
  angthe = 30;
  rectsiz = 0.06;
  majav = (0,0,maja);
  aphiv = raya*(cosd(angphi),sind(angphi),0);
  aphip = raya*(sind(angphi),-cosd(angphi),0);
  majbv = planarrotation( majav, aphip, angthe );
  perpv = ncrossprod(majbv,aphiv);
  decl = Z(perpv)/(Y(perpv)++X(perpv));
  valy = maja*raya/((decl*raya)++maja);
  valz = valy*decl;
  if angthe>90: valy:=-valy; fi;
  perpv := blue*valz-N(aphip)*valy;
  perpvl = maja*N(perpv);
  spheroid( black, majav, raya );
  drawoptions( dashed (withdots scaled 0.25) );
  cartaxes( 1, 1, 1 );
  draw rigorouscircle( black, blue, raya );
  draw rp(black)--rp(-aphiv);
  draw rp(black)--rp(-majbv);
  %draw rp(black)--rp(-majav);
  %draw rp(black)--rp(-aphip);
  %draw rp(black)--rp(-perpv);
  draw ellipticpath( black, majbv, aphiv );
  drawoptions();
  drawarrow rp((raya,0,0))--rp((1,0,0));
  drawarrow rp((0,raya,0))--rp((0,1,0));
  drawarrow rp(majav)--rp((0,0,1));
  drawoptions( withpen pencircle scaled 1.7pt withcolor 0.65blue );
  drawarrow rp(black)--rp(aphiv);
  drawarrow rp(black)--rp(majbv);
  %draw rp(black)--rp(majav);
  %drawarrow rp(black)--rp(aphip);
  drawarrow rp(black)--rp(perpvl);
  drawoptions( withpen pencircle scaled 1.3pt );
  draw subpath (-1,15) of ellipticpath( black, majbv, aphiv ) dashed evenly;
  %draw ellipticpath( black, aphip, majav ) dashed evenly;
  % draw ellipticpath( black, green, 2*blue ) dashed evenly;
  drawoptions();
  squareangline( perpv, aphiv, black, rectsiz);
  squareangline( perpv, majbv, black, rectsiz);
  squareangline( majbv, aphiv, black, rectsiz);
  angline(majav, perpv, black, maja-raya, btex $\theta$ etex)(rt);
  pickup pencircle scaled 3.6pt;
  draw rp(-aphiv); %label.bot("aphiv",rp(aphiv));
  draw rp(-majbv); %label.lft("majbv",rp(majbv));
  %draw rp(majav); label.rt("majav",rp(majav));
  %draw rp(-aphip); label.rt("aphip",rp(aphip));
  draw rp(perpv); %label.rt("perpv",rp(perpvl));
  label.llft(btex $\vec{n}^{\prime\prime}$ etex,rp(aphiv));
  label.ulft(btex $\vec{n}^{\prime}$ etex,rp(majbv));
  label.top(btex $\vec{p}$ etex,rp(perpvl));
endfig;


verbatimtex \end{document} etex

end;