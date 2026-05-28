input featpost3Dplus2D;
input latexmp;

beginfig(1);
    f := (10,4,5);
    Spread := 35;
    color O,I,J,K,vecteur,projvec,vecttheta;

    % Origine et repère initial
    O = (0,0,0);
    I = (1,0,0);
    J = (0,1,0);
    K = (0,0,1);
    radius := 3;
    phi := 30;
    theta := 45;
    vecteur = (radius*cosd(theta)*sind(phi),radius*sind(theta)*sind(phi),    radius*cosd(phi));
    vecttheta := (radius*cosd(theta),radius*sind(theta), 0);
    projvec := (redpart vecteur, greenpart vecteur, 0);
    tropicalglobe( 1, black, radius,blue );
    draw rigorouscircle(black,blue,radius) dashed evenly;
    draw rigorouscircle(black,red,radius) dashed evenly;
    draw rigorouscircle(black,green,radius) dashed evenly;
    drawarrow rp(O)--rp(radius*K);
    drawarrow rp(O)--rp(-radius*K);
    drawarrow rp(O)--rp(vecteur);
    draw rp(O)--rp(vecttheta) dashed evenly;
    draw rp(vecteur)--rp(projvec) dashed evenly;
    axesSize := 3;
    orthaxes(axesSize,textext(""),axesSize,textext(""),axesSize,textext(""));
    dotlabel.top(textext("$|1\rangle$"),rp(radius*K));
    dotlabel.bot(textext("$|0\rangle$"),rp(-radius*K));
    dotlabel.rt(textext("$|\psi\rangle$"),rp(vecteur));

    angline(K,vecteur,O,1.2,textext("$\varphi$"),urt);
    angline(I,vecttheta,O,1.2,textext("$\theta$"),urt);
    ;
endfig;


end;