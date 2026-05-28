input featpost;

prologues := 3;
outputtemplate := "svg/%j-%c.svg";
outputformat := "svg";

%f := (5,4,0);
Spread := 200;
SphericalDistortion:=true;

background:=(0.2,0.2,0.2);
color foreground;
foreground := (0.8,0.8,0.8);

let FourPoint = cmykcolor;
FourPoint sommets[];

sommets[1] = (1,1,1,1);
sommets[2] = (1,-1,1,1);
sommets[3] = (-1,1,1,1);
sommets[4] = (-1,-1,1,1);
sommets[5] = (1,1,-1,1);
sommets[6] = (1,-1,-1,1);
sommets[7] = (-1,1,-1,1);
sommets[8] = (-1,-1,-1,1);
sommets[9] = (1,1,1,-1);
sommets[10] = (1,-1,1,-1);
sommets[11] = (-1,1,1,-1);
sommets[12] = (-1,-1,1,-1);
sommets[13] = (1,1,-1,-1);
sommets[14] = (1,-1,-1,-1);
sommets[15] = (-1,1,-1,-1);
sommets[16] = (-1,-1,-1,-1);

_d = 10;
def ThreeProj(expr c)=
    (_d/(_d+blackpart c))*(cyanpart c, magentapart c, yellowpart c)
enddef;

_pi:=3.141592654;
_e:=2.718281828;

vardef sin(expr x) = sind(180*x/_pi) enddef;

vardef cos(expr x) = cosd(180*x/_pi) enddef;

def FourLength(expr c)=
    sqrt((cyanpart c)**2+ (magentapart c)**2+ (yellowpart c)**2+(blackpart c)**2)
enddef;

def drawcube(expr theta) =
for i=1 upto 16:
    for j=i+1 upto 16:
        if(FourLength(sommets[i]-sommets[j])<2.01):
            draw pathofstraightline(ThreeProj(rotrot(sommets[i],theta)),ThreeProj(rotrot(sommets[j],theta)))
            withcolor background withpen pencircle scaled 2.5;
            draw
            pathofstraightline(ThreeProj(rotrot(sommets[i],theta)),ThreeProj(rotrot(sommets[j],theta)))
            withcolor foreground withpen pencircle scaled 2.;
        fi
    endfor;
endfor;
for i=1 upto 16:
    signalvertex(ThreeProj(rotrot(sommets[i],theta)),2.2,background);
    signalvertex(ThreeProj(rotrot(sommets[i],theta)),2,foreground);
endfor;
enddef;



def rotXY(expr c,theta)=
    (cyanpart c, magentapart c, (yellowpart c)*cos(theta)+(blackpart c)*sin(theta),-(yellowpart c)*sin(theta)+(blackpart c)*cos(theta))
enddef;


def rotYZ(expr c,theta)=
    ((cyanpart c)*cos(theta)+(blackpart c)*sin(theta), magentapart c, yellowpart c,-(cyanpart c)*sin(theta)+(blackpart c)*cos(theta))
enddef;


def rotrot(expr c,theta)=
    rotXY(rotYZ(c,theta),theta)
enddef;
u:=1cm;
path frame;
for i=0 upto 359:
beginfig(i);
frame := ((-u,-u)--(12u,-u)--(12u,12u)--(-u,12u)--cycle) shifted (5u,5u);
fill frame withcolor background;
draw frame withcolor background;
drawcube(i/360*2*_pi);
clip currentpicture to frame;
endfig;
endfor;
end.