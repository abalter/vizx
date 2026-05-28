%@author: Maxime Chupin
%@date: 2026/02/10


prologues := 3;
outputtemplate := "svg/%j-%c.svg";
outputformat := "svg";

input geom2d;

a:=1;
b:=1.5a;
c:=3.0a;
O = Point(0,0);
A = Point(a,0);

nbrImg := 100;
angleMax :=80;


epaisseur := 2.5;

for i=0 upto 2*nbrImg:

beginfig(i);
if(i<=nbrImg):
    rot := -angleMax+(i/nbrImg)*2*angleMax;
else:
    rot := angleMax-((i-nbrImg)/nbrImg)*2*angleMax;
fi

P := Addition(A,Point(a*cosd(rot),a*sind(rot)));
CP := Cercle(P,b);
CO := Cercle(O,c);

N1 := IntersectionCercles(CO,CP);
N2 := IntersectionCercles(CP,CO);
CN1 := Cercle(N1,b);
CN2 := Cercle(N2,b);
M := IntersectionCercles(CN1,CN2);

drawoptions(avecCrayon(0.8,DarkGrey));
trace AxeOx;
trace Droite(Point(Abscisse(M),0),Point(Abscisse(M),3));

drawoptions(avecCrayon(epaisseur,Goldenrod));
trace Segment(O,A);
trace Segment(A,P);

drawoptions(avecCrayon(epaisseur,FireBrick));
trace Segment(P,N1);
trace Segment(P,N2);
trace Segment(M,N1);
trace Segment(M,N2);

drawoptions(avecCrayon(epaisseur,DarkSeaGreen));
trace Segment(O,N1);
trace Segment(O,N2);

drawoptions();
marque.bot "O";
marque.bot "A";
marque.rt "P";
gddLabel.top(textext("$N_1$"),N1);
gddLabel.bot(textext("$N_2$"),N2);
pointe N1; pointe N2;
marque.rt "M";
Fenetre(-0.4,-3.2,4.5,3.2);
endfig;

endfor;

end.