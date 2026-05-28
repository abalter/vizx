%@title: Pavages aléatoires par touillage de dominos
%@author: Maxime Chupin
%@date: 2026/01/14
%@description: Pavages aléatoires par touillage de dominos
% d'après le code de MicMaths sur sa chaîne Mathsdrop
% et l'article «Pavages aléatoires par touillage de dominos»
% du site Images des maths É. Janvresse, T. de la Rue
%
%https://images-des-maths.pages.math.cnrs.fr/freeze/Pavages-aleatoires-par-touillage-de-dominos.html



% taille d'une casse du damier
u:=0.2cm;

numeric domino[][];
numeric N;

N := 2;

% les deux éléments de pavage
path hori;
path verti;

hori := (0,0)--(2*u,0)--(2*u,u)--(0,u)--cycle;
verti := (0,0)--(0,2*u)--(u,2*u)--(u,0)--cycle;

% nos quatres couleurs
color pavage[];
pavage[0]:=(0.99,0.85,0.17);
pavage[1]:=(0.0,0.0,0.82);
pavage[2]:=(0.82,0.0,0.0);
pavage[3]:=(0.0,0.82,0.82);


% initialisation
for i:=0 upto 2*N-1:
    for j:=0 upto 2*N-1:
        domino[i][j]:=0;
    endfor;
endfor;

domino[1][0]:=1;
domino[0][1]:=2;
domino[1][1]:=2;
domino[1][3]:=1;
domino[2][1]:=1;
domino[2][2]:=1;


% fonction pour représenter un pavage
def traceDomino=
    for i:=0 upto 2*N-1:
        for j:=0 upto 2*N-1:
            if(domino[i][j]=1): % si on a un domino horizontal
                if(((i+j+N+1) mod 2)=0):
                    filldraw hori shifted (i*u,j*u) withcolor pavage0;
                else:
                    filldraw hori shifted (i*u,j*u) withcolor pavage1;
                fi
                %draw hori shifted (i*u,j*u);
            elseif(domino[i][j]=2): % si on a un domino vertical
                if(((i+j+N+1) mod 2)=0):
                    filldraw verti shifted (i*u,j*u) withcolor pavage2;
                else:
                    filldraw verti shifted (i*u,j*u) withcolor pavage3;
                fi
                %draw verti shifted (i*u,j*u);
            fi
        endfor
    endfor
enddef;


% l'algorithme en lui même.
numeric copydom[][],resultat[][];

def iteration=
    save M,i,j;
    numeric M;
    numeric i,j;
    M:=N+1;
    % initialisation de copydom à zéro
    for i:=0 upto 2*M-1:
        for j:=0 upto 2*M-1:
            copydom[i][j]:=0;
            resultat[i][j]:=0;
        endfor
    endfor
    % on recopie à l'intérieur de copydom dom
    for i:=0 upto 2*N-1:
        for j:=0 upto 2*N-1:
            copydom[i+1][j+1]:=domino[i][j];
        endfor
    endfor

    for j:=0 upto 2*M-1:
        for i:=0 upto 2*M-1:
            if((abs(M-i-1)+abs(M-j-1)<=M)):% si on est bien dans le carré astèque
                % on teste la parité du bord pour étudier les carrés intérieurs
                if(((i+j+M+1)  mod 2)=0):
                    if(copydom[i][j]=1): % un carré avec un domino hori on première ligne
                        if(copydom[i][j+1]<>1): % si en dessous on n'a pas un domino
                            resultat[i][j+1]:=1;
                        fi
                        % sinon on laisse le carré à zéro
                    elseif(copydom[i][j]=2): % un carré avec un domino verti en première colonne
                        if(copydom[i+1][j]<>2): % si à droite on n'a pas un domino
                            resultat[i+1][j]:=2;
                        fi
                        % sinon on laisse le carré à zéro
                    else: %si la case en bas à gauche est à zéro
                        if(copydom[i][j+1]=1): % si au dessus on a  un domino
                        %hori
                            resultat[i][j]:=1; % on descend le domino
                        elseif(copydom[i+1][j]=2): % si à droite on a  un domino
                        %verti
                            resultat[i][j]:=2; % on le met à gauche
                        else: % domino vide on tire au sort si on le peuple par
                        %deux
                            %hori  ou deux verti
                            if(uniformdeviate(1)<0.5):
                                resultat[i][j]:=1;
                                resultat[i][j+1]:=1;
                            else:
                                resultat[i][j]:=2;
                                resultat[i+1][j]:=2;
                            fi
                        fi
                    fi
                fi
            fi
        endfor
    endfor
    % on recopie resultat dans domino et on met N à N+1
    N:=N+1;
    for i:=0 upto 2*N-1:
        for j:=0 upto 2*N-1:
            domino[i][j]:=resultat[i][j];
        endfor
    endfor
enddef;

vardef addbackground(expr c) =
    picture current;
    path bb;
    current := currentpicture;
    bbmargin := 0.2cm;
    bb := bbox current;
    fill bb withcolor c;
    draw current;
enddef;

drawoptions(withpen pencircle scaled 0.1);





%beginfig(0);
%    traceDomino;
%endfig;
for k:=1 upto 150:
    iteration;
endfor
beginfig(1);
    traceDomino;
    addbackground((0.2,0.2,0.2));
endfig;
end.