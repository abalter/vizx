input geom2d;

gddU:=0.7cm;

beginfig(1);
    r = 2.5;
    R = 3.5;
    A = Point(0,0);
    C_A = Cercle(A,2*R);
    C = Point(2r,0);
    B = Point(2R,0);
    C_V = CercleD(A,B);
    C_U = CercleD(A,C);
    C_CB=CercleD(C,B);
    V = Centre(C_V);
    U = Centre(C_U);
    AB = Droite(A,B);
    I_CU = Inversion(C_U,C_A);
    I_CV = Inversion(C_V,C_A);

    L_AB = Droite(A,B);
    Up = IntersectionDroites(L_AB,I_CU);
    Vp = IntersectionDroites(L_AB,I_CV);
    Cp0 = CercleD(Vp,Up);
    Rp= Rayon(Cp0);


    colorieAvecTransparence(C_V,DodgerBlue,0.2);
    trace C_V avecCrayon(1.3,DodgerBlue);

    colorie C_U withcolor 4.9*FireBrick;
    trace C_U avecCrayon(1.3,FireBrick);
    colorie C_CB withcolor DodgerBlue;
    trace I_CV avecCrayon(1,DodgerBlue);
    trace I_CU avecCrayon(1,FireBrick);

    Ip[0] = Milieu(Vp,Up);
    N=9;
    trace Cp0;
    for i:=-N upto N:
        if(i<>0):
        Ip[i] = Addition(Ip[0],Point(0,i*2*Rp));
        Mp[i] = Addition(Ip[i],Point(-Rp,0));
        DAMp[i] = Droite(A,Mp[i]);
        DVIp[i] = Droite(V,Ip[i]);
        DAIp[i] = Droite(A,Ip[i]);
        M[i] = IntersectionDroiteCercle(DAMp[i],C_V,2);
        DVM[i] = Droite(V,M[i]);
        I[i] = IntersectionDroites(DAIp[i],DVM[i]);
        colorie CercleCP(I[i],M[i]) withcolor DodgerBlue;
        trace CercleCP(Ip[i],Mp[i]);
        if(i=1):
            drawoptions(dashed evenly);
            trace DAIp[i];trace DVM[i];trace DAMp[i];
            drawoptions();
            pointe Ip[i]; pointe Mp[i];
            pointe M[i]; pointe I[i];
            gddLabel.rt(textext("$I'$"),Ip[i]);
            gddLabel.lrt(textext("$I$"),I[i]);
            gddLabel.rt(textext("$M'$"),Mp[i]);
            gddLabel.ulft(textext("$M$"),M[i]);
        fi
        fi
    endfor;
    trace AB dashed evenly;
    marque.bot "U";
    marque.llft "V";
    marque.ulft "A"; marque.lrt "B"; marque.lrt "C";
    trace C_A dashed evenly;

    Fenetre(-1,-2.5R,3*R,2.5R);
endfig;

end.

%%%%% English version

input geom2d;

gddU:=0.7cm;

beginfig(1);
    r = 2.5;
    R = 3.5;
    A = Point(0,0);
    C_A = Circle(A,2*R);
    C = Point(2r,0);
    B = Point(2R,0);
    C_V = CircleD(A,B);
    C_U = CircleD(A,C);
    C_CB=CircleD(C,B);
    V = Center(C_V);
    U = Center(C_U);
    AB = Line(A,B);
    I_CU = Inverse(C_U,C_A);
    I_CV = Inverse(C_V,C_A);

    L_AB = Line(A,B);
    Up = LinesIntersection(L_AB,I_CU);
    Vp = LinesIntersection(L_AB,I_CV);
    Cp0 = CircleD(Vp,Up);
    Rp= Radius(Cp0);


    gddAlphaFill(C_V,DodgerBlue,0.2);
    gddDraw C_V withPen(1.3,DodgerBlue);

    gddFill C_U withcolor 4.9*FireBrick;
    gddDraw C_U withPen(1.3,FireBrick);
    gddFill C_CB withcolor DodgerBlue;
    gddDraw I_CV withPen(1,DodgerBlue);
    gddDraw I_CU withPen(1,FireBrick);

    Ip[0] = MidPoint(Vp,Up);
    N=9;
    gddDraw Cp0;
    for i:=-N upto N:
        if(i<>0):
        Ip[i] = Addition(Ip[0],Point(0,i*2*Rp));
        Mp[i] = Addition(Ip[i],Point(-Rp,0));
        DAMp[i] = Line(A,Mp[i]);
        DVIp[i] = Line(V,Ip[i]);
        DAIp[i] = Line(A,Ip[i]);
        M[i] = LineCircleIntersection(DAMp[i],C_V,2);
        DVM[i] = Line(V,M[i]);
        I[i] = LinesIntersection(DAIp[i],DVM[i]);
        gddFill CircleCP(I[i],M[i]) withcolor DodgerBlue;
        gddDraw CircleCP(Ip[i],Mp[i]);
        if(i=1):
            drawoptions(dashed evenly);
            gddDraw DAIp[i];gddDraw DVM[i];gddDraw DAMp[i];
            drawoptions();
            gddDrawPoint Ip[i]; gddDrawPoint Mp[i];
            gddDrawPoint M[i]; gddDrawPoint I[i];
            gddLabel.rt(textext("$I'$"),Ip[i]);
            gddLabel.lrt(textext("$I$"),I[i]);
            gddLabel.rt(textext("$M'$"),Mp[i]);
            gddLabel.ulft(textext("$M$"),M[i]);
        fi
        fi
    endfor;
    gddDraw AB dashed evenly;
    gddMark.bot "U";
    gddMark.llft "V";
    gddMark.ulft "A"; gddMark.lrt "B"; gddMark.lrt "C";
    gddDraw C_A dashed evenly;

    Window(-1,-2.5R,3*R,2.5R);
endfig;

end.