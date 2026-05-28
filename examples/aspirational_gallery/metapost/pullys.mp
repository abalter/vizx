%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Système-de-poulies.tex - Système de poulies, à l'équilibre.
% figure latex metapost
% J. Labbé, avril 2026
%
% This work is marked with CC0 1.0 (Public Domain Dedication). To view a copy of
% this license, visit http://creativecommons.org/publicdomain/zero/1.0
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  vardef angle_mark(expr A, O, B, r, n) = image(
    angle_mark_aux (A,O,B,r);
    if n>1 : angle_mark_aux (A,O,B,r-1/2mm); fi;
    if n>2 : angle_mark_aux (A,O,B,r+1/2mm); fi;
    if n>3 : angle_mark_aux (A,O,B,r-1mm); fi;
  ) enddef;

  vardef angle_mark_aux (expr A,O,B,d) =
    linecap := butt;
    draw (O + d*unitvector(A-O))
         { d*unitvector(A-O) rotated 90 }
         ..
         { d*unitvector(B-O) rotated 90 }
         (O + d*unitvector(B-O));
  enddef;

  vardef label_angle (expr A, O, B, r, l) =
    label(l, O + r * unitvector (unitvector(A-O) + unitvector(B-O)) );
  enddef;

  beginfig(0);
  input fiziko

  numeric u, w, r;

  u   := 1cm;

  w   := 5u;    % ground width
  r   := 0.3u;  % pulley radius

  y1 := -9/5u; % left mass postion
  m1 := 3/5u;  % left mass size
  y2 := -4/4u; % centered mass postion
  x2 := u/3;   % centered mass shift
  m2 := u;     % centered mass size
  y3 := -2u;   % right mass postion
  m3 := 4/5u;  % right mass size

  %% Pulleys

  path pulleyShape[];
  draw solidSurface (right * w/2 -- left * w/2);
  draw pulley (2r, 0) shifted (-w/4, -pulleySupportSize * 2r);
  pulleyShape1 := pulleyOutline shifted (-w/4, -pulleySupportSize * 2r);
  draw pulley (2r, 0) shifted (+w/4, -pulleySupportSize * 2r);
  pulleyShape2 := pulleyOutline shifted (w/4, -pulleySupportSize * 2r);

  %% Masses

  z11 = point 4 of pulleyShape1;
  x1  = x11;
  z12 = point 9 of pulleyShape1;
  z13 = z2 shifted (left * 1pt);
  z14 = z2 shifted (right * 1pt);
  z15 = point 3 of pulleyShape2;
  z16 = point 8 of pulleyShape2;
  x3  = x16;

  picture masses; masses = image (
    draw z1 -- z11{up} .. z12 -- z13 -- z14 -- z15 .. {down}z16 -- z3;
    draw weight.h (m1) shifted z1;
    draw weight.h (m2) shifted z2;
    draw weight.h (m3) shifted z3;
    label.lft("$m_1$", z1) shifted (-1/3m1, -2/3m1);
    label.rt ("$m$", z2)   shifted (+1/3m2, -2/3m2);
    label.rt ("$m_2$", z3) shifted (+1/3m2, -2/3m2);
  );
  draw masses maskedWith pulleyShape1 maskedWith pulleyShape2;

  %% Angles
  z4 = (z2 + up * 1cm);
  draw (z2 + up * 1pt) -- z4
      dashed evenly withpen thinpen;
  draw angle_mark(z4, z2, z12, 2/5u, 1);
  draw angle_mark(z15, z2, z4, 3/5u, 2);
  label_angle (z4, z2, z12, 3/5u, "$\alpha_1$");
  label_angle (z15, z2, z4, 4/5u, "$\alpha_2$");

  endfig;
end.