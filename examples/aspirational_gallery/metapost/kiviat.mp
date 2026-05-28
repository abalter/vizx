%@author: Maxime Chupin
%@date 19/05/2025


input mpkiviat;
beginfig(1);
set_lattice_grid(100,500);
set_kiviat_unit(0.4cm);
set_axis("McCabe","LOC","Live Variables","Halstead N","Variablenspanne");
draw_axis;
filldraw_line(400,300,380,200,250)(red);
set_line_mark_type("circle");
filldraw_line(300,320,180,400,150)(blue);
set_line_mark_type("square");
set_line_mark_scale(2);
filldraw_line(100,420,280,200,50)(green);
endfig;
end.