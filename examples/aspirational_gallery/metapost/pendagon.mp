input geom2d;

beginfig(1);
r = 3;
O = Point(0,0);
A = Point(0,r);
A' = Point(0,-r);
U = Point(r,0);
U' = Point(-r,0);
arc1 = Arc(U,2/3*r,1.5*Pi/2,0.8*Pi);
arc2 = Arc(O,2/3*r,0.35*Pi/2,0.3*Pi);
arc3 = Arc(U,2/3*r,-1.5*Pi/2,-0.8*Pi);
arc4 = Arc(O,2/3*r,-0.35*Pi/2,-0.3*Pi);
C1 = Cercle(O,2/3r);
C2 = Cercle(U,2/3r);
C_O = Cercle(O,r);
P1 = IntersectionCercles(C1,C2);
P2 = IntersectionCercles(C2,C1);
K = Milieu(U,O);
C_KA = CercleCP(K,A);
L = IntersectionDroiteCercle(Droite(O,U),C_KA,1);
T = IntersectionDroiteCercle(Droite(O,U),C_KA,2);

C_AL = CercleCP(A,L);
C_AT = CercleCP(A,T);
B = IntersectionCercles(C_O,C_AL);
E = IntersectionCercles(C_AL,C_O);
C = IntersectionCercles(C_O,C_AT);
D = IntersectionCercles(C_AT,C_O);

pentagone = Polygone(A,B,C,D,E);

drawoptions(avecCrayon(0.5,DarkGray));
trace Droite(O,U);
trace Droite(O,A);
trace arc1; trace arc2; trace arc3; trace arc4;

drawoptions(avecCrayon(1, LightCoral));
trace C_O;
gddLabel.ulft(textext("$\mathcal{C}$"),PointPolaire(r,2/3*Pi));


drawoptions(avecCrayon(0.5,DarkGray) dashed evenly);
trace Segment(P1,P2) ;
trace Segment(A,K);
trace Segment(A,T);

drawoptions(avecCrayon(0.7,LightSkyBlue));
trace C_AL;
trace C_AT;
gddLabel.llft(textext("$\mathcal{C}_{AL}$"),Addition(A,PointPolaire(Rayon(C_AL),1.1*Pi)));
gddLabel.llft(textext("$\mathcal{C}_{AT}$"),Addition(A,PointPolaire(Rayon(C_AT),4/3*Pi)));

drawoptions(avecCrayon(0.7,Thistle));
trace C_KA;
gddLabel.lrt(textext("$\mathcal{C}_{KA}$"),Addition(K,PointPolaire(Rayon(C_KA),5.5/3*Pi)));


trace pentagone avecCrayon(1.2,DarkSeaGreen);
drawoptions();

marque.urt "A";
marque.urt "O";
marque.llft "K";
marque.urt "L";
marque.llft "U";
marque.llft "T";
marque.llft "B";
marque.llft "C";
marque.lrt "D";
marque.rt "E";

Fenetre(-2r,-1.2r,2r,1.2r);
endfig;
end.